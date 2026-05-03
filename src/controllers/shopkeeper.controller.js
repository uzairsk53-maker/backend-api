const shopkeeperService = require('../services/shopkeeper.service');
const { successResponse, errorResponse } = require('../utils/response');
const { updateProfileSchema } = require('../validators/shopkeeper.validator');

class ShopkeeperController {
    getStatusCode(error) {
        if (error.message === 'Shopkeeper profile not found') return 404;
        if (error.message === 'User not found') return 404;
        if (error.message.includes('Shopkeeper profile not found.')) return 404;
        return 400;
    }

    async getDashboard(req, res) {
        try {
            const data = await shopkeeperService.getDashboardData(req.user.id);
            return successResponse(res, data, 'Dashboard retrieved successfully');
        } catch (error) {
            return errorResponse(res, this.getStatusCode(error), error.message);
        }
    }

    async updateProfile(req, res) {
        try {
            const { error, value } = updateProfileSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const profile = await shopkeeperService.updateProfile(req.user.id, value);
            return successResponse(res, profile, 'Profile updated successfully');
        } catch (error) {
            return errorResponse(res, this.getStatusCode(error), error.message);
        }
    }
}

module.exports = new ShopkeeperController();
