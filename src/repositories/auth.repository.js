const { prisma } = require('../config/db');

class AuthRepository {
    async findUserByPhoneAndRole(phone, role) {
        return await prisma.user.findFirst({
            where: {
                phone: phone,
                role: role
            }
        });
    }

    async findUserById(id) {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    }

    async createUser(userData) {
        return await prisma.user.create({
            data: {
                phone: userData.phone,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                refreshToken: userData.refreshToken
            }
        });
    }

    async createShopkeeper(shopkeeperData) {
        return await prisma.shopkeeper.create({
            data: {
                userId: shopkeeperData.user_id,
                shopName: shopkeeperData.shopName,
                ownerName: shopkeeperData.ownerName,
                phone: shopkeeperData.phone,
                email: shopkeeperData.email,
                address: shopkeeperData.address,
                city: shopkeeperData.city,
                creditScore: shopkeeperData.creditScore || 10000,
                creditPoints: shopkeeperData.creditPoints || 0
            }
        });
    }

    async updateRefreshToken(userId, refreshToken) {
        return await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: refreshToken }
        });
    }

    async updatePassword(userId, password) {
        return await prisma.user.update({
            where: { id: userId },
            data: { password: password }
        });
    }

    async findUserByRefreshToken(refreshToken) {
        return await prisma.user.findFirst({
            where: { refreshToken: refreshToken }
        });
    }
}

module.exports = new AuthRepository();
