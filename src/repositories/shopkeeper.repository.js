const { prisma } = require('../config/db');

class ShopkeeperRepository {
    buildUpdatePayload(updateData) {
        return Object.fromEntries(
            Object.entries({
                shopName: updateData.shopName,
                ownerName: updateData.ownerName,
                phone: updateData.phone,
                email: updateData.email,
                address: updateData.address,
                city: updateData.city,
                creditScore: updateData.creditScore,
                creditPoints: updateData.creditPoints
            }).filter(([, value]) => value !== undefined)
        );
    }

    async findByUserId(userId) {
        return await prisma.shopkeeper.findUnique({
            where: { userId: userId },
            include: {
                user: {
                    select: {
                        email: true,
                        phone: true
                    }
                }
            }
        });
    }

    async updateProfile(userId, updateData) {
        const existingProfile = await this.findByUserId(userId);
        if (!existingProfile) return null;

        return await prisma.shopkeeper.update({
            where: { userId: userId },
            data: this.buildUpdatePayload(updateData)
        });
    }

    async createProfileForUser(userId, profileData) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { phone: true, email: true }
        });

        if (!user) return null;

        return await prisma.shopkeeper.create({
            data: {
                userId: userId,
                shopName: profileData.shopName,
                ownerName: profileData.ownerName,
                phone: profileData.phone ?? user.phone,
                email: profileData.email ?? user.email,
                address: profileData.address,
                city: profileData.city
            }
        });
    }

    async updateCreditPoints(userId, newPoints) {
        const existingProfile = await this.findByUserId(userId);
        if (!existingProfile) return null;

        return await prisma.shopkeeper.update({
            where: { userId: userId },
            data: { creditPoints: newPoints }
        });
    }

    async findAll(skip = 0, limit = 10) {
        return await prisma.shopkeeper.findMany({
            skip: skip,
            take: limit,
            include: {
                user: {
                    select: {
                        phone: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async countDocuments() {
        return await prisma.shopkeeper.count();
    }
}

module.exports = new ShopkeeperRepository();
