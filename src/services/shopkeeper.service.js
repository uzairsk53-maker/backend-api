const shopkeeperRepo = require('../repositories/shopkeeper.repository');

class ShopkeeperService {
    async getProfile(userId) {
        const profile = await shopkeeperRepo.findByUserId(userId);
        if (!profile) throw new Error('Shopkeeper profile not found');
        return profile;
    }

    async updateProfile(userId, updateData) {
        const existingProfile = await shopkeeperRepo.findByUserId(userId);
        if (!existingProfile) {
            if (!updateData.shopName || !updateData.ownerName) {
                throw new Error('Shopkeeper profile not found. Provide shopName and ownerName to create profile.');
            }

            const createdProfile = await shopkeeperRepo.createProfileForUser(userId, updateData);
            if (!createdProfile) throw new Error('User not found');
            return createdProfile;
        }

        const profile = await shopkeeperRepo.updateProfile(userId, updateData);
        if (!profile) throw new Error('Shopkeeper profile not found');
        return profile;
    }

    async getDashboardData(userId) {
        const profile = await this.getProfile(userId);
        // You would also aggregate orders here
        return {
            profile,
            creditSummary: {
                score: profile.creditScore,
                points: profile.creditPoints
            }
        };
    }
}

module.exports = new ShopkeeperService();
