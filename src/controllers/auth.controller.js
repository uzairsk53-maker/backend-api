const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');
const { registerShopkeeperSchema, loginSchema, refreshTokenSchema } = require('../validators/auth.validator');

class AuthController {
    async registerShopkeeper(req, res) {
        try {
            const { error, value } = registerShopkeeperSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            await authService.registerShopkeeper(value);
            return successResponse(res, null, 'Shopkeeper registered successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async registerAdmin(req, res) {
        try {
            // For admin, we can use a simple schema or no validation for now
            const { phone, password, email } = req.body;
            if (!phone || !password) return errorResponse(res, 400, 'Phone and password are required');

            await authService.registerAdmin({ phone, password, email });
            return successResponse(res, null, 'Admin registered successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async login(req, res) {
        try {
            const { error, value } = loginSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const data = await authService.login(value.phone, value.password, value.role);
            return successResponse(res, data, 'Login successful');
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }

    async refresh(req, res) {
        try {
            const { error, value } = refreshTokenSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const data = await authService.refreshTokens(value.refreshToken);
            return successResponse(res, data, 'Tokens refreshed');
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }
}

module.exports = new AuthController();
