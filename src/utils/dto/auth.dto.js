const Joi = require('joi');

exports.registerDto = Joi.object({
  shopName: Joi.string().required().min(3).max(100),
  mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
  password: Joi.string().required().min(6)
});

exports.loginDto = Joi.object({
  mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
  password: Joi.string().required()
});
