const Joi = require('joi');

const registerShopkeeperSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(6).required(),
    shopName: Joi.string().required(),
    ownerName: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required()
});

const loginSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().required(),
    role: Joi.string().trim().uppercase().valid('ADMIN', 'SHOPKEEPER', 'DELIVERY').required()
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

module.exports = {
    registerShopkeeperSchema,
    loginSchema,
    refreshTokenSchema
};
