const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');

class DeliveryController {
    async createDeliveryBoy(req, res) {
        try {
            const { phone, name, password, vehicleNo, city } = req.body;
            
            // Create user for auth
            const existingUser = await prisma.user.findUnique({ where: { phone } });
            if (existingUser) return errorResponse(res, 400, 'User with this phone already exists');

            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: { phone, password: hashedPassword, role: 'DELIVERY' }
                });
                await tx.deliveryBoy.create({
                    data: { name, phone, vehicleNo, city }
                });
            });

            return successResponse(res, { phone }, 'Delivery boy created');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getDeliveryBoys(req, res) {
        try {
            const boys = await prisma.deliveryBoy.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return successResponse(res, boys, 'List retrieved');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getProfile(req, res) {
        try {
            // req.user has phone, id, role
            const deliveryBoy = await prisma.deliveryBoy.findUnique({
                where: { phone: req.user.phone }
            });

            if (!deliveryBoy) {
                // Auto create if missing
                const newDeliveryBoy = await prisma.deliveryBoy.create({
                    data: { name: 'Delivery User', phone: req.user.phone }
                });
                return successResponse(res, { profile: newDeliveryBoy }, 'Profile retrieved');
            }

            return successResponse(res, { profile: deliveryBoy }, 'Profile retrieved');
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, email, vehicleNo, city, latitude, longitude } = req.body;
            
            const updated = await prisma.deliveryBoy.upsert({
                where: { phone: req.user.phone },
                update: {
                    ...(name && { name }),
                    ...(email !== undefined && { email }),
                    ...(vehicleNo !== undefined && { vehicleNo }),
                    ...(city !== undefined && { city }),
                    ...(latitude !== undefined && { latitude }),
                    ...(longitude !== undefined && { longitude }),
                },
                create: {
                    phone: req.user.phone,
                    name: name || 'Delivery User',
                    email,
                    vehicleNo,
                    city,
                    latitude,
                    longitude
                }
            });

            return successResponse(res, { profile: updated }, 'Profile updated');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async updateLocation(req, res) {
        try {
            const { latitude, longitude } = req.body;
            if (latitude === undefined || longitude === undefined) {
                return errorResponse(res, 400, 'Latitude and longitude are required');
            }

            const updated = await prisma.deliveryBoy.upsert({
                where: { phone: req.user.phone },
                update: { latitude, longitude },
                create: {
                    phone: req.user.phone,
                    name: 'Delivery User',
                    latitude,
                    longitude
                }
            });

            return successResponse(res, { location: { latitude: updated.latitude, longitude: updated.longitude } }, 'Location updated');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

module.exports = new DeliveryController();
