const orderService = require('../services/order.service');
const { successResponse, errorResponse } = require('../utils/response');
const { createOrderSchema, updateOrderStatusSchema, assignDeliverySchema } = require('../validators/order.validator');

class OrderController {
    async createOrder(req, res) {
        try {
            const { error, value } = createOrderSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            // only shopkeepers can create orders
            if (req.user.role !== 'SHOPKEEPER') {
                return errorResponse(res, 403, 'Requires SHOPKEEPER role');
            }

            const order = await orderService.createOrder(req.user.id, value);
            return successResponse(res, order, 'Order created successfully', 201);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getOrders(req, res) {
        try {
            const data = await orderService.getOrders(req.query);
            return successResponse(res, data, 'Orders retrieved successfully');
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getOrderById(req, res) {
        try {
            const data = await orderService.getOrderById(req.params.id);
            if (!data) return errorResponse(res, 404, 'Order not found');
            return successResponse(res, data, 'Order retrieved');
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { error, value } = updateOrderStatusSchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const order = await orderService.updateOrderStatus(req.params.id, value.status);
            return successResponse(res, order, 'Order status updated');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async assignDeliveryBoy(req, res) {
        try {
            const { error, value } = assignDeliverySchema.validate(req.body);
            if (error) return errorResponse(res, 400, error.details[0].message);

            const order = await orderService.assignDeliveryBoy(req.params.id, value.deliveryBoyId);
            return successResponse(res, order, 'Delivery boy assigned');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

module.exports = new OrderController();
