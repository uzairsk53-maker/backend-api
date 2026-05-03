const creditService = require('../services/credit.service');
const { successResponse, errorResponse } = require('../utils/response');
const Joi = require('joi');

const manualRepaymentSchema = Joi.object({
    shopkeeperId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    isLate: Joi.boolean().default(false)
});

class CreditController {
    // Expected to be called by Delivery Boy or Admin after collecting cash
    async manualRepayment(req, res) {
        try {
            const { error, value } = manualRepaymentSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const profile = await creditService.addPointsAfterRepayment(
                value.shopkeeperId,
                value.amount,
                value.isLate
            );

            return successResponse(res, { creditScore: profile.creditScore, creditPoints: profile.creditPoints }, 'Repayment processed successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

module.exports = new CreditController();
