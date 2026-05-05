const Joi = require('joi');

const updateProfileSchema = Joi.object({
    shopName: Joi.string().optional(),
    ownerName: Joi.string().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    email: Joi.string().email().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional()
});

module.exports = {
    updateProfileSchema
};
