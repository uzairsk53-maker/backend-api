const Joi = require('joi');

const updateProfileSchema = Joi.object({
    shopName: Joi.string().optional(),
    ownerName: Joi.string().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    email: Joi.string().email().optional()
});

module.exports = {
    updateProfileSchema
};
