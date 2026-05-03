const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');

class DeliveryController {
    async createDeliveryBoy(req, res) {
        try {
            const { phone, name, password } = req.body;
            const existing = await User.findOne({ phone, role: 'DELIVERY' });
            if (existing) return errorResponse(res, 400, 'Delivery boy already exists');

            const hashedPassword = await bcrypt.hash(password, 10);
            const deliveryBoy = new User({ phone, name, password: hashedPassword, role: 'DELIVERY' });
            await deliveryBoy.save();

            return successResponse(res, { id: deliveryBoy._id, phone: deliveryBoy.phone }, 'Delivery boy created');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getDeliveryBoys(req, res) {
        try {
            const boys = await User.find({ role: 'DELIVERY' }).select('-password');
            return successResponse(res, boys, 'List retrieved');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

module.exports = new DeliveryController();
