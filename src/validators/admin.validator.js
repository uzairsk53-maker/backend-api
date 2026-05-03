const Joi = require('joi');

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('', null),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  category: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  bulkPrice: Joi.number().min(0).allow(null),
  creditPrice: Joi.number().min(0).allow(null),
  stock: Joi.number().integer().min(0).required(),
  fastDeliveryEligible: Joi.boolean().default(false),
  images: Joi.array().items(Joi.string().uri()).default([]),
});

const updateProductSchema = createProductSchema.fork(['name', 'category', 'price', 'stock'], (field) => field.optional());

const updateOrderStatusSchema = Joi.object({ status: Joi.string().valid('PENDING', 'APPROVED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED').required() });
const approveOrderSchema = Joi.object({ note: Joi.string().allow('', null) });
const assignDeliveryBoySchema = Joi.object({ deliveryBoyId: Joi.string().uuid().required(), notes: Joi.string().allow('', null) });
const cancelOrderSchema = Joi.object({ reason: Joi.string().trim().min(3).required() });

const createDeliveryBoySchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  phone: Joi.string().trim().min(8).max(15).required(),
  email: Joi.string().email().allow('', null),
  vehicleNo: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true),
  // password is intentionally excluded — stripUnknown drops it before Prisma sees it
}).options({ stripUnknown: true });

const updateDeliveryBoySchema = createDeliveryBoySchema.fork(['name', 'phone'], (f) => f.optional());
const updateDeliveryStatusSchema = Joi.object({ status: Joi.string().valid('ASSIGNED', 'PICKED', 'IN_TRANSIT', 'DELIVERED', 'FAILED').required(), notes: Joi.string().allow('', null) });
const assignDeliverySchema = Joi.object({ deliveryBoyId: Joi.string().uuid().required(), notes: Joi.string().allow('', null) });

const creditSettingSchema = Joi.object({ items: Joi.array().items(Joi.object({ key: Joi.string().required(), value: Joi.string().required(), label: Joi.string().required(), description: Joi.string().allow('', null) })).min(1).required() });
const penaltyRuleSchema = Joi.object({ name: Joi.string().required(), description: Joi.string().allow('', null), condition: Joi.string().required(), penaltyType: Joi.string().valid('PERCENT', 'FLAT').required(), value: Joi.number().min(0).required(), isActive: Joi.boolean().default(true) });
const bonusRuleSchema = Joi.object({ name: Joi.string().required(), description: Joi.string().allow('', null), condition: Joi.string().required(), bonusType: Joi.string().valid('PERCENT', 'FLAT').required(), value: Joi.number().min(0).required(), isActive: Joi.boolean().default(true) });
const manualAdjustmentSchema = Joi.object({ shopkeeperId: Joi.string().uuid().required(), type: Joi.string().valid('DEBIT', 'CREDIT').required(), amount: Joi.number().positive().required(), description: Joi.string().allow('', null) });
const manualRepaymentSchema = Joi.object({ shopkeeperId: Joi.string().uuid().required(), amount: Joi.number().positive().required(), notes: Joi.string().allow('', null) });

module.exports = {
  paginationQuerySchema,
  createProductSchema,
  updateProductSchema,
  updateOrderStatusSchema,
  approveOrderSchema,
  assignDeliveryBoySchema,
  cancelOrderSchema,
  createDeliveryBoySchema,
  updateDeliveryBoySchema,
  updateDeliveryStatusSchema,
  assignDeliverySchema,
  creditSettingSchema,
  penaltyRuleSchema,
  bonusRuleSchema,
  manualAdjustmentSchema,
  manualRepaymentSchema,
};
