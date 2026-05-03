const orderRepo = require('../repositories/order.repository');
const creditService = require('./credit.service');
const shopkeeperRepo = require('../repositories/shopkeeper.repository');
const appEmitter = require('../utils/events');

class OrderService {
    async createOrder(userId, data) {
        const shopkeeperProfile = await shopkeeperRepo.findByUserId(userId);
        if (!shopkeeperProfile) {
            throw new Error('Shopkeeper profile not found');
        }

        if (data.paymentType === 'CREDIT' || data.paymentType === 'HYBRID') {
            if (data.creditUsed > 0) {
                // Deduct credit points from Shopkeeper
                await creditService.deductPoints(userId, data.creditUsed);
            }
        }

        const orderData = {
            ...data,
            // orders.shopkeeper_id references shopkeepers.id (not users.id)
            shopkeeperId: shopkeeperProfile.id,
            repaymentDeadline: data.creditUsed > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
        };

        const order = await orderRepo.create(orderData);
        
        // Notify admin via WebSocket that a new order is placed
        appEmitter.emit('orderCreated', order);
        
        return order;
    }

    async getOrders(query) {
        const { page = 1, limit = 10, status, date } = query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (status) filter.status = status;
        if (date) {
            // Prisma date filter
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1); // Next day
            filter.createdAt = {
                gte: startDate,
                lt: endDate
            };
        }

        const orders = await orderRepo.findAll(filter, skip, parseInt(limit));
        const total = await orderRepo.countDocuments(filter);

        return {
            orders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total
        };
    }

    async getOrderById(id) {
        return orderRepo.findById(id);
    }

    async updateOrderStatus(id, status) {
        const order = await orderRepo.update(id, { status });
        if (!order) throw new Error('Order not found');
        
        // Real-time tracking push
        appEmitter.emit('orderStatusUpdated', order);

        return order;
    }

    async assignDeliveryBoy(id, deliveryBoyId) {
        const order = await orderRepo.update(id, { deliveryBoyId, status: 'APPROVED' });
        if (!order) throw new Error('Order not found');

        appEmitter.emit('deliveryAssigned', order);

        return order;
    }
}

module.exports = new OrderService();
