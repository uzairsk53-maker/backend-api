const Joi = require('joi');

const addProductSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().positive().required(),
    bulkPrice: Joi.number().positive().required(),
    stock: Joi.number().min(0).required(),
    images: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional()
});

const updateProductSchema = Joi.object({
    name: Joi.string().optional(),
    category: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    bulkPrice: Joi.number().positive().optional(),
    stock: Joi.number().min(0).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional()
});

module.exports = {
    addProductSchema,
    updateProductSchema
};
