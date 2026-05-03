const xlsx = require('xlsx');
const adminRepo = require('../repositories/admin.repository');
const { prisma } = require('../config/db');

class AdminService {
  async getDashboardSummary() { return adminRepo.getDashboardSummary(); }
  async getRevenueGraph(period) { return adminRepo.getRevenueGraph(period); }
  async getRecentOrders(limit) { return adminRepo.getRecentOrders(limit); }

  async getProducts(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;
    const result = await adminRepo.findProducts(query, skip, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc');
    return { items: result.products, totalItems: result.total, page, limit, totalPages: Math.ceil(result.total / limit) || 1 };
  }

  async getProductById(id) { return adminRepo.findProductById(id); }

  async createProduct(adminUserId, payload, files = []) {
    const product = await adminRepo.createProduct({
      name: payload.name,
      category: payload.category,
      description: payload.description || null,
      price: payload.price,
      bulkPrice: payload.bulkPrice ?? null,
      creditPrice: payload.creditPrice ?? null,
      stock: payload.stock,
      fastDeliveryEligible: payload.fastDeliveryEligible,
      images: payload.images || [],
    });

    if (files.length) {
      await adminRepo.createProductImages(files.map((f, i) => ({ productId: product.id, url: f.path && f.path.startsWith('http') ? f.path : `/uploads/${f.filename}`, sortOrder: i })));
    }

    await this.logAudit(adminUserId, 'CREATE', 'PRODUCT', product.id, null, product);
    return product;
  }

  async updateProduct(adminUserId, id, payload) {
    const existing = await adminRepo.findProductById(id);
    const updated = await adminRepo.updateProduct(id, payload);
    await this.logAudit(adminUserId, 'UPDATE', 'PRODUCT', id, existing, updated);
    return updated;
  }

  async deleteProduct(adminUserId, id) {
    const existing = await adminRepo.findProductById(id);
    const deleted = await adminRepo.deleteProduct(id);
    await this.logAudit(adminUserId, 'DELETE', 'PRODUCT', id, existing, null);
    return deleted;
  }

  async bulkUploadProducts(adminUserId, file) {
    const wb = xlsx.read(file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const rowsData = rows.map((r) => ({
      name: String(r.name || r.Name || '').trim(),
      category: String(r.category || r.Category || '').trim(),
      description: r.description || r.Description || null,
      price: Number(r.price || r.Price || 0),
      bulkPrice: r.bulkPrice || r.BulkPrice ? Number(r.bulkPrice || r.BulkPrice) : null,
      creditPrice: r.creditPrice || r.CreditPrice ? Number(r.creditPrice || r.CreditPrice) : null,
      stock: Number(r.stock || r.Stock || 0),
      fastDeliveryEligible: Boolean(r.fastDeliveryEligible || r.FastDeliveryEligible || false),
      images: [],
    })).filter((r) => r.name && r.category);

    const result = await adminRepo.bulkCreateProducts(rowsData);
    await this.logAudit(adminUserId, 'BULK_UPLOAD', 'PRODUCT', null, null, { count: result.count });
    return result;
  }

  async getOrders(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;
    const result = await adminRepo.findOrders(query, skip, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc');
    return { items: result.orders, totalItems: result.total, page, limit, totalPages: Math.ceil(result.total / limit) || 1 };
  }

  async getOrderById(id) { return adminRepo.findOrderById(id); }

  async approveOrder(adminUserId, id) {
    const existing = await adminRepo.findOrderById(id);
    const updated = await adminRepo.updateOrder(id, { status: 'APPROVED' });
    await this.logAudit(adminUserId, 'APPROVE', 'ORDER', id, existing, updated);
    return updated;
  }

  async assignDeliveryBoy(adminUserId, id, deliveryBoyId, notes) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id } });
      const order = await tx.order.update({ where: { id }, data: { status: 'APPROVED' } });
      const assignment = await tx.deliveryAssignment.create({ data: { orderId: id, deliveryBoyId, notes: notes || null } });
      await tx.auditLog.create({ data: { userId: adminUserId, action: 'ASSIGN', entity: 'ORDER_DELIVERY', entityId: id, oldData: existing || undefined, newData: assignment } });
      return { order, assignment };
    });
  }

  async updateOrderStatus(adminUserId, id, status) {
    const existing = await adminRepo.findOrderById(id);
    const updated = await adminRepo.updateOrder(id, { status });
    await this.logAudit(adminUserId, 'UPDATE_STATUS', 'ORDER', id, existing, updated);
    return updated;
  }

  async updateDeliveryStatus(adminUserId, deliveryId, payload) {
    return prisma.$transaction(async (tx) => {
      // 1. Update delivery assignment status
      const assignment = await tx.deliveryAssignment.update({
        where: { id: deliveryId },
        data: {
          status: payload.status,
          notes: payload.notes || null,
          ...(payload.status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        },
        include: { order: { include: { shopkeeper: true } } },
      });

      // 2. If DELIVERED → sync Order status + award credit
      if (payload.status === 'DELIVERED') {
        // Sync order to DELIVERED
        await tx.order.update({ where: { id: assignment.orderId }, data: { status: 'DELIVERED' } });

        const shopkeeper = assignment.order?.shopkeeper;
        if (shopkeeper) {
          // Fetch bonus setting (default 50 pts if not set)
          const setting = await tx.creditSetting.findUnique({ where: { key: 'delivery_bonus' } });
          const bonusPts = setting ? Number(setting.value) : 50;

          // Award credit points
          await tx.shopkeeper.update({
            where: { id: shopkeeper.id },
            data: { creditPoints: { increment: bonusPts } },
          });

          // Log credit transaction
          await tx.creditTransaction.create({
            data: {
              shopkeeperId: shopkeeper.id,
              orderId: assignment.orderId,
              type: 'CREDIT',
              amount: bonusPts,
              description: `Delivery bonus — order delivered on time`,
              status: 'CLEARED',
              isManual: false,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'UPDATE_DELIVERY_STATUS',
          entity: 'DELIVERY_ASSIGNMENT',
          entityId: deliveryId,
          newData: { status: payload.status },
        },
      });

      return assignment;
    });
  }

  async cancelOrder(adminUserId, id, reason) {
    const existing = await adminRepo.findOrderById(id);
    const updated = await adminRepo.updateOrder(id, { status: 'CANCELLED', cancelReason: reason });
    await this.logAudit(adminUserId, 'CANCEL', 'ORDER', id, existing, updated);
    return updated;
  }

  async getShopkeepers(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;
    const result = await adminRepo.findShopkeepers(query, skip, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc');
    return { items: result.shopkeepers, totalItems: result.total, page, limit, totalPages: Math.ceil(result.total / limit) || 1 };
  }

  async blockShopkeeper(adminUserId, id) { return this.updateShopkeeperStatus(adminUserId, id, 'BLOCKED'); }
  async unblockShopkeeper(adminUserId, id) { return this.updateShopkeeperStatus(adminUserId, id, 'ACTIVE'); }

  async updateShopkeeperStatus(adminUserId, id, status) {
    const existing = await adminRepo.findShopkeeperById(id);
    const updated = await adminRepo.updateShopkeeper(id, { status });
    await this.logAudit(adminUserId, 'UPDATE_STATUS', 'SHOPKEEPER', id, existing, updated);
    return updated;
  }

  async resetCreditScore(adminUserId, id) {
    const existing = await adminRepo.findShopkeeperById(id);
    const updated = await adminRepo.updateShopkeeper(id, { creditScore: 10000, creditPoints: 0, riskLevel: 'LOW' });
    await this.logAudit(adminUserId, 'RESET_SCORE', 'SHOPKEEPER', id, existing, updated);
    return updated;
  }

  async getCreditSettings() { return adminRepo.getCreditSettings(); }
  async updateCreditSettings(adminUserId, items) {
    const ops = items.map((i) => adminRepo.upsertCreditSetting(i.key, i.value, i.label, i.description || null));
    const result = await Promise.all(ops);
    await this.logAudit(adminUserId, 'UPDATE', 'CREDIT_SETTINGS', null, null, result);
    return result;
  }

  async manualCreditAdjustment(adminUserId, payload) {
    return prisma.$transaction(async (tx) => {
      const shopkeeper = await tx.shopkeeper.findUnique({ where: { id: payload.shopkeeperId } });
      if (!shopkeeper) throw new Error('Shopkeeper not found');
      const delta = payload.type === 'CREDIT' ? payload.amount : -payload.amount;
      const newPoints = Math.max(0, shopkeeper.creditPoints + delta);
      await tx.shopkeeper.update({ where: { id: payload.shopkeeperId }, data: { creditPoints: newPoints } });
      const txn = await tx.creditTransaction.create({
        data: {
          shopkeeperId: payload.shopkeeperId,
          type: payload.type,
          amount: payload.amount,
          description: payload.description || 'Manual adjustment by admin',
          isManual: true,
          adjustedBy: adminUserId,
          status: 'CLEARED',
        },
      });
      await tx.auditLog.create({ data: { userId: adminUserId, action: 'MANUAL_ADJUSTMENT', entity: 'CREDIT_TRANSACTION', entityId: txn.id, newData: txn } });
      return txn;
    });
  }

  async manualRepaymentConfirmation(adminUserId, payload) {
    return prisma.$transaction(async (tx) => {
      const repayment = await tx.manualRepayment.create({
        data: {
          shopkeeperId: payload.shopkeeperId,
          amount: payload.amount,
          collectedBy: adminUserId,
          notes: payload.notes || null,
          status: 'ON_TIME',
          confirmedAt: new Date(),
        },
      });
      await tx.creditTransaction.create({
        data: {
          shopkeeperId: payload.shopkeeperId,
          type: 'CREDIT',
          amount: payload.amount,
          description: 'Manual repayment confirmation',
          isManual: true,
          adjustedBy: adminUserId,
          status: 'CLEARED',
        },
      });
      return repayment;
    });
  }

  async logAudit(userId, action, entity, entityId, oldData, newData) {
    try {
      await adminRepo.createAuditLog({ userId, action, entity, entityId: entityId || null, oldData: oldData || undefined, newData: newData || undefined });
    } catch (_) {}
  }
}

module.exports = new AdminService();
