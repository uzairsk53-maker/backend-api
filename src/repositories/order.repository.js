const { prisma } = require('../config/db');

class OrderRepository {
    async create(data) {
        // Create order with items in a transaction
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    shopkeeperId: data.shopkeeperId,
                    deliveryBoyId: data.deliveryBoyId,
                    totalAmount: data.totalAmount,
                    orderType: data.orderType || 'NORMAL',
                    creditUsed: data.creditUsed || 0,
                    cashAmount: data.cashAmount || 0,
                    paymentType: data.paymentType,
                    status: data.status || 'PENDING',
                    expectedDelivery: data.expectedDelivery,
                    repaymentDeadline: data.repaymentDeadline
                }
            });

            // Create order items
            if (data.products && Array.isArray(data.products)) {
                const orderItems = data.products.map(product => ({
                    orderId: order.id,
                    productId: product.productId,
                    quantity: product.quantity,
                    priceAtOrder: product.priceAtOrder
                }));

                await tx.orderItem.createMany({
                    data: orderItems
                });
            }

            return order;
        });
    }

    async findById(id) {
        return await prisma.order.findUnique({
            where: { id: id },
            include: {
                shopkeeper: {
                    include: {
                        user: {
                            select: {
                                phone: true,
                                email: true
                            }
                        }
                    }
                },
                deliveryBoy: {
                    select: {
                        phone: true,
                        email: true
                    }
                },
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async update(id, data) {
        return await prisma.$transaction(async (tx) => {
            // Update order
            const order = await tx.order.update({
                where: { id: id },
                data: {
                    shopkeeperId: data.shopkeeperId,
                    deliveryBoyId: data.deliveryBoyId,
                    totalAmount: data.totalAmount,
                    orderType: data.orderType,
                    creditUsed: data.creditUsed,
                    cashAmount: data.cashAmount,
                    paymentType: data.paymentType,
                    status: data.status,
                    expectedDelivery: data.expectedDelivery,
                    repaymentDeadline: data.repaymentDeadline
                }
            });

            // Update order items if provided
            if (data.products && Array.isArray(data.products)) {
                // Delete existing items
                await tx.orderItem.deleteMany({
                    where: { orderId: id }
                });

                // Create new items
                const orderItems = data.products.map(product => ({
                    orderId: id,
                    productId: product.productId,
                    quantity: product.quantity,
                    priceAtOrder: product.priceAtOrder
                }));

                await tx.orderItem.createMany({
                    data: orderItems
                });
            }

            return order;
        });
    }

    async findAll(filter = {}, skip = 0, limit = 10, sort = 'createdAt') {
        const orderBy = sort.includes('DESC') ? { [sort.replace(' DESC', '')]: 'desc' } : { [sort]: 'asc' };

        return await prisma.order.findMany({
            where: filter,
            skip: skip,
            take: limit,
            orderBy: orderBy,
            include: {
                shopkeeper: {
                    include: {
                        user: {
                            select: {
                                phone: true,
                                email: true
                            }
                        }
                    }
                },
                deliveryBoy: {
                    select: {
                        phone: true,
                        email: true
                    }
                },
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async countDocuments(filter = {}) {
        return await prisma.order.count({
            where: filter
        });
    }

    async updateStatus(id, status) {
        return await prisma.order.update({
            where: { id: id },
            data: { status: status }
        });
    }

    async assignDeliveryBoy(orderId, deliveryBoyId) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { deliveryBoyId: deliveryBoyId }
        });
    }
}

module.exports = new OrderRepository();
