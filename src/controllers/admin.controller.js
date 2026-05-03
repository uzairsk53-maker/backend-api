const adminService = require('../services/admin.service');
const adminRepo = require('../repositories/admin.repository');
const { successResponse, errorResponse } = require('../utils/response');
const {
  paginationQuerySchema, createProductSchema, updateProductSchema, updateOrderStatusSchema,
  assignDeliveryBoySchema, cancelOrderSchema, createDeliveryBoySchema, updateDeliveryBoySchema,
  updateDeliveryStatusSchema, assignDeliverySchema, creditSettingSchema, penaltyRuleSchema,
  bonusRuleSchema, manualAdjustmentSchema, manualRepaymentSchema,
} = require('../validators/admin.validator');

class AdminController {
  validate(schema, payload, res) {
    const { error, value } = schema.validate(payload);
    if (error) {
      errorResponse(res, 400, error.details[0].message);
      return null;
    }
    return value;
  }

  async getDashboardSummary(req, res) { try { return successResponse(res, await adminService.getDashboardSummary(), 'Dashboard summary fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async getRevenueGraph(req, res) { try { return successResponse(res, await adminService.getRevenueGraph(req.query.period || 'monthly'), 'Revenue graph fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async getRecentOrders(req, res) { try { return successResponse(res, await adminService.getRecentOrders(Number(req.query.limit || 10)), 'Recent orders fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }

  async getProducts(req, res) { try { const q = this.validate(paginationQuerySchema, req.query, res); if (!q) return; return successResponse(res, await adminService.getProducts({ ...req.query, ...q }), 'Products fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async getProductById(req, res) { try { return successResponse(res, await adminService.getProductById(req.params.id), 'Product fetched'); } catch (e) { return errorResponse(res, 404, e.message); } }
  async createProduct(req, res) { try { const b = this.validate(createProductSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.createProduct(req.user.id, b, req.files || []), 'Product created'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async updateProduct(req, res) { try { const b = this.validate(updateProductSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.updateProduct(req.user.id, req.params.id, b), 'Product updated'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async deleteProduct(req, res) { try { await adminService.deleteProduct(req.user.id, req.params.id); return successResponse(res, null, 'Product deleted'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async bulkUploadProducts(req, res) { try { if (!req.file) return errorResponse(res, 400, 'Excel file is required'); return successResponse(res, await adminService.bulkUploadProducts(req.user.id, req.file), 'Bulk upload complete'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async uploadImages(req, res) { try { const urls = (req.files || []).map((f) => `/uploads/${f.filename}`); return successResponse(res, { urls }, 'Images uploaded'); } catch (e) { return errorResponse(res, 400, e.message); } }

  async getOrders(req, res) { try { return successResponse(res, await adminService.getOrders(req.query), 'Orders fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async getOrderById(req, res) { try { return successResponse(res, await adminService.getOrderById(req.params.id), 'Order fetched'); } catch (e) { return errorResponse(res, 404, e.message); } }
  async approveOrder(req, res) { try { return successResponse(res, await adminService.approveOrder(req.user.id, req.params.id), 'Order approved'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async assignDeliveryBoy(req, res) { try { const b = this.validate(assignDeliveryBoySchema, req.body, res); if (!b) return; return successResponse(res, await adminService.assignDeliveryBoy(req.user.id, req.params.id, b.deliveryBoyId, b.notes), 'Delivery boy assigned'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async updateOrderStatus(req, res) { try { const b = this.validate(updateOrderStatusSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.updateOrderStatus(req.user.id, req.params.id, b.status), 'Order status updated'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async cancelOrder(req, res) { try { const b = this.validate(cancelOrderSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.cancelOrder(req.user.id, req.params.id, b.reason), 'Order cancelled'); } catch (e) { return errorResponse(res, 400, e.message); } }

  async getShopkeepers(req, res) { try { return successResponse(res, await adminService.getShopkeepers(req.query), 'Shopkeepers fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async getShopkeeperById(req, res) { try { return successResponse(res, await adminRepo.findShopkeeperById(req.params.id), 'Shopkeeper fetched'); } catch (e) { return errorResponse(res, 404, e.message); } }
  async blockShopkeeper(req, res) { try { return successResponse(res, await adminService.blockShopkeeper(req.user.id, req.params.id), 'Shopkeeper blocked'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async unblockShopkeeper(req, res) { try { return successResponse(res, await adminService.unblockShopkeeper(req.user.id, req.params.id), 'Shopkeeper unblocked'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async resetCreditScore(req, res) { try { return successResponse(res, await adminService.resetCreditScore(req.user.id, req.params.id), 'Credit score reset'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async getShopkeeperHistory(req, res) { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20), skip = (page - 1) * limit; return successResponse(res, await adminRepo.getShopkeeperCreditHistory(req.params.id, skip, limit), 'Credit history fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async getShopkeeperOrders(req, res) { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20), skip = (page - 1) * limit; return successResponse(res, await adminRepo.getShopkeeperOrders(req.params.id, skip, limit), 'Order history fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }

  async getCreditSettings(req, res) { try { return successResponse(res, await adminService.getCreditSettings(), 'Credit settings fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async updateCreditSettings(req, res) { try { const b = this.validate(creditSettingSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.updateCreditSettings(req.user.id, b.items), 'Credit settings updated'); } catch (e) { return errorResponse(res, 400, e.message); } }

  async getPenaltyRules(req, res) { try { return successResponse(res, await adminRepo.findPenaltyRules(), 'Penalty rules fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async createPenaltyRule(req, res) { try { const b = this.validate(penaltyRuleSchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.createPenaltyRule(b), 'Penalty rule created'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async updatePenaltyRule(req, res) { try { const b = this.validate(penaltyRuleSchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.updatePenaltyRule(req.params.id, b), 'Penalty rule updated'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async deletePenaltyRule(req, res) { try { await adminRepo.deletePenaltyRule(req.params.id); return successResponse(res, null, 'Penalty rule deleted'); } catch (e) { return errorResponse(res, 400, e.message); } }

  async getBonusRules(req, res) { try { return successResponse(res, await adminRepo.findBonusRules(), 'Bonus rules fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async createBonusRule(req, res) { try { const b = this.validate(bonusRuleSchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.createBonusRule(b), 'Bonus rule created'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async updateBonusRule(req, res) { try { const b = this.validate(bonusRuleSchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.updateBonusRule(req.params.id, b), 'Bonus rule updated'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async deleteBonusRule(req, res) { try { await adminRepo.deleteBonusRule(req.params.id); return successResponse(res, null, 'Bonus rule deleted'); } catch (e) { return errorResponse(res, 400, e.message); } }

  async manualAdjustment(req, res) { try { const b = this.validate(manualAdjustmentSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.manualCreditAdjustment(req.user.id, b), 'Manual adjustment done'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async getCreditTransactions(req, res) { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20), skip = (page - 1) * limit; return successResponse(res, await adminRepo.findCreditTransactions(req.query, skip, limit), 'Credit transactions fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }

  async getDeliveryBoys(req, res) { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 10), skip = (page - 1) * limit; return successResponse(res, await adminRepo.findDeliveryBoys(req.query, skip, limit), 'Delivery boys fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async createDeliveryBoy(req, res) { try { const b = this.validate(createDeliveryBoySchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.createDeliveryBoy(b), 'Delivery boy created'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async updateDeliveryBoy(req, res) { try { const b = this.validate(updateDeliveryBoySchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.updateDeliveryBoy(req.params.id, b), 'Delivery boy updated'); } catch (e) { return errorResponse(res, 400, e.message); } }

  async getDeliveries(req, res) { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 10), skip = (page - 1) * limit; return successResponse(res, await adminRepo.findDeliveries(req.query, skip, limit), 'Deliveries fetched'); } catch (e) { return errorResponse(res, 500, e.message); } }
  async assignDelivery(req, res) { try { const b = this.validate(assignDeliverySchema, req.body, res); if (!b) return; return successResponse(res, await adminRepo.createDeliveryAssignment({ orderId: req.params.id, deliveryBoyId: b.deliveryBoyId, notes: b.notes || null }), 'Delivery assigned'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async updateDeliveryStatus(req, res) { try { const b = this.validate(updateDeliveryStatusSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.updateDeliveryStatus(req.user.id, req.params.id, b), 'Delivery status updated'); } catch (e) { return errorResponse(res, 400, e.message); } }
  async manualRepaymentConfirmation(req, res) { try { const b = this.validate(manualRepaymentSchema, req.body, res); if (!b) return; return successResponse(res, await adminService.manualRepaymentConfirmation(req.user.id, b), 'Manual repayment confirmed'); } catch (e) { return errorResponse(res, 400, e.message); } }
}

module.exports = new AdminController();
