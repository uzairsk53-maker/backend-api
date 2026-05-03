const { prisma } = require('../config/db');

class AdminRepository {
  // ─── Dashboard ───
  async getDashboardSummary() {
    const [totalOrders, totalShopkeepers, orderStats, creditExposure, topShopkeepers] = await Promise.all([
      prisma.order.count(),
      prisma.shopkeeper.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true, creditUsed: true, cashAmount: true },
      }),
      prisma.shopkeeper.aggregate({
        _sum: { creditPoints: true },
        _avg: { creditScore: true },
      }),
      prisma.shopkeeper.findMany({
        take: 5,
        orderBy: { creditScore: 'desc' },
        select: { id: true, shopName: true, ownerName: true, creditScore: true, creditPoints: true },
      }),
    ]);

    const riskCounts = await prisma.shopkeeper.groupBy({
      by: ['riskLevel'],
      _count: { id: true },
    });

    return {
      totalOrders,
      totalShopkeepers,
      totalRevenue: orderStats._sum.totalAmount || 0,
      totalCreditUsed: orderStats._sum.creditUsed || 0,
      totalCashCollected: orderStats._sum.cashAmount || 0,
      creditExposure: creditExposure._sum.creditPoints || 0,
      avgCreditScore: Math.round(creditExposure._avg.creditScore || 0),
      topShopkeepers,
      riskSummary: riskCounts.reduce((acc, r) => {
        acc[r.riskLevel] = r._count.id;
        return acc;
      }, {}),
    };
  }

  async getRevenueGraph(period = 'monthly') {
    const now = new Date();
    let startDate;

    if (period === 'weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    } else {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
    }

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { totalAmount: true, creditUsed: true, cashAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return orders;
  }

  async getRecentOrders(limit = 10) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        shopkeeper: { select: { shopName: true, ownerName: true } },
        deliveryBoy: { select: { phone: true } },
      },
    });
  }

  // ─── Products ───
  async findProducts(filter = {}, skip = 0, limit = 10, sortField = 'createdAt', sortOrder = 'desc') {
    const where = {};
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { category: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.category) where.category = filter.category;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: { productImages: true },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: { productImages: true, orderItems: { take: 5, include: { order: true } } },
    });
  }

  async createProduct(data) {
    return prisma.product.create({ data });
  }

  async updateProduct(id, data) {
    return prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id) {
    return prisma.product.delete({ where: { id } });
  }

  async bulkCreateProducts(products) {
    return prisma.product.createMany({ data: products, skipDuplicates: true });
  }

  async createProductImages(images) {
    return prisma.productImage.createMany({ data: images });
  }

  // ─── Orders ───
  async findOrders(filter = {}, skip = 0, limit = 10, sortField = 'createdAt', sortOrder = 'desc') {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.paymentType) where.paymentType = filter.paymentType;
    if (filter.shopkeeperId) where.shopkeeperId = filter.shopkeeperId;
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
      if (filter.dateTo) where.createdAt.lte = new Date(filter.dateTo);
    }
    if (filter.search) {
      where.OR = [
        { shopkeeper: { shopName: { contains: filter.search, mode: 'insensitive' } } },
        { shopkeeper: { ownerName: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          shopkeeper: { select: { shopName: true, ownerName: true, phone: true } },
          deliveryBoy: { select: { phone: true } },
          products: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findOrderById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        shopkeeper: { include: { user: { select: { phone: true, email: true } } } },
        deliveryBoy: { select: { phone: true, email: true } },
        products: { include: { product: true } },
        creditTransactions: true,
        deliveryAssignments: { include: { deliveryBoy: true } },
      },
    });
  }

  async updateOrder(id, data) {
    return prisma.order.update({ where: { id }, data });
  }

  // ─── Shopkeepers ───
  async findShopkeepers(filter = {}, skip = 0, limit = 10, sortField = 'createdAt', sortOrder = 'desc') {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.riskLevel) where.riskLevel = filter.riskLevel;
    if (filter.city) where.city = { contains: filter.city, mode: 'insensitive' };
    if (filter.search) {
      where.OR = [
        { shopName: { contains: filter.search, mode: 'insensitive' } },
        { ownerName: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [shopkeepers, total] = await Promise.all([
      prisma.shopkeeper.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          user: { select: { phone: true, email: true, role: true } },
          _count: { select: { orders: true } },
        },
      }),
      prisma.shopkeeper.count({ where }),
    ]);

    return { shopkeepers, total };
  }

  async findShopkeeperById(id) {
    return prisma.shopkeeper.findUnique({
      where: { id },
      include: {
        user: { select: { phone: true, email: true } },
        _count: { select: { orders: true, creditTransactions: true } },
      },
    });
  }

  async updateShopkeeper(id, data) {
    return prisma.shopkeeper.update({ where: { id }, data });
  }

  async getShopkeeperCreditHistory(shopkeeperId, skip = 0, limit = 20) {
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { shopkeeperId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.creditTransaction.count({ where: { shopkeeperId } }),
    ]);
    return { transactions, total };
  }

  async getShopkeeperOrders(shopkeeperId, skip = 0, limit = 20) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { shopkeeperId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { products: { include: { product: { select: { name: true } } } } },
      }),
      prisma.order.count({ where: { shopkeeperId } }),
    ]);
    return { orders, total };
  }

  // ─── Delivery Boys ───
  async findDeliveryBoys(filter = {}, skip = 0, limit = 10) {
    const where = {};
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [deliveryBoys, total] = await Promise.all([
      prisma.deliveryBoy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { assignments: true } } },
      }),
      prisma.deliveryBoy.count({ where }),
    ]);
    return { deliveryBoys, total };
  }

  async createDeliveryBoy(data) {
    return prisma.deliveryBoy.create({ data });
  }

  async updateDeliveryBoy(id, data) {
    return prisma.deliveryBoy.update({ where: { id }, data });
  }

  async findDeliveryBoyById(id) {
    return prisma.deliveryBoy.findUnique({
      where: { id },
      include: { _count: { select: { assignments: true } } },
    });
  }

  // ─── Delivery Assignments ───
  async findDeliveries(filter = {}, skip = 0, limit = 10) {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.deliveryBoyId) where.deliveryBoyId = filter.deliveryBoyId;

    const [deliveries, total] = await Promise.all([
      prisma.deliveryAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { include: { shopkeeper: { select: { shopName: true } } } },
          deliveryBoy: { select: { name: true, phone: true } },
        },
      }),
      prisma.deliveryAssignment.count({ where }),
    ]);
    return { deliveries, total };
  }

  async createDeliveryAssignment(data) {
    return prisma.deliveryAssignment.create({ data });
  }

  async updateDeliveryAssignment(id, data) {
    return prisma.deliveryAssignment.update({ where: { id }, data });
  }

  // ─── Credit Settings ───
  async getCreditSettings() {
    return prisma.creditSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertCreditSetting(key, value, label, description) {
    return prisma.creditSetting.upsert({
      where: { key },
      update: { value, label, description },
      create: { key, value, label, description },
    });
  }

  // ─── Credit Penalty Rules ───
  async findPenaltyRules() {
    return prisma.creditPenaltyRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPenaltyRule(data) {
    return prisma.creditPenaltyRule.create({ data });
  }

  async updatePenaltyRule(id, data) {
    return prisma.creditPenaltyRule.update({ where: { id }, data });
  }

  async deletePenaltyRule(id) {
    return prisma.creditPenaltyRule.delete({ where: { id } });
  }

  // ─── Credit Bonus Rules ───
  async findBonusRules() {
    return prisma.creditBonusRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createBonusRule(data) {
    return prisma.creditBonusRule.create({ data });
  }

  async updateBonusRule(id, data) {
    return prisma.creditBonusRule.update({ where: { id }, data });
  }

  async deleteBonusRule(id) {
    return prisma.creditBonusRule.delete({ where: { id } });
  }

  // ─── Credit Transactions ───
  async findCreditTransactions(filter = {}, skip = 0, limit = 20) {
    const where = {};
    if (filter.shopkeeperId) where.shopkeeperId = filter.shopkeeperId;
    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.isManual !== undefined) where.isManual = filter.isManual;

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { shopkeeper: { select: { shopName: true, ownerName: true } } },
      }),
      prisma.creditTransaction.count({ where }),
    ]);
    return { transactions, total };
  }

  async createCreditTransaction(data) {
    return prisma.creditTransaction.create({ data });
  }

  // ─── Manual Repayments ───
  async createManualRepayment(data) {
    return prisma.manualRepayment.create({ data });
  }

  // ─── Audit Log ───
  async createAuditLog(data) {
    return prisma.auditLog.create({ data });
  }

  async findAuditLogs(skip = 0, limit = 50) {
    return prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Lookups ───
  async getCategories() {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return products.map(p => p.category);
  }

  async getStatusList() {
    return ['PENDING', 'APPROVED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  }

  async getDeliveryBoysList() {
    return prisma.deliveryBoy.findMany({
      where: { isActive: true },
      select: { id: true, name: true, phone: true },
      orderBy: { name: 'asc' },
    });
  }

  async getShopkeepersList() {
    return prisma.shopkeeper.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, shopName: true, ownerName: true },
      orderBy: { shopName: 'asc' },
    });
  }
}

module.exports = new AdminRepository();
