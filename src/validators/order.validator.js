const Joi = require('joi');

const createOrderSchema = Joi.object({
    products: Joi.array().items(
        Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().positive().required(),
            priceAtOrder: Joi.number().positive().required()
        })
    ).min(1).required(),
    orderType: Joi.string().valid('NORMAL', 'BULK', 'FAST_DELIVERY').required(),
    totalAmount: Joi.number().positive().required(),
    creditUsed: Joi.number().min(0).default(0),
    cashAmount: Joi.number().min(0).default(0),
    paymentType: Joi.string().valid('CASH', 'CREDIT', 'HYBRID').required(),
    expectedDelivery: Joi.date().required()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('PENDING', 'APPROVED', 'PACKED', 'SHIPPED', 'DELIVERED').required()
});

const assignDeliverySchema = Joi.object({
    deliveryBoyId: Joi.string().required()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    assignDeliverySchema
};
