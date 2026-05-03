const shopkeeperRepo = require('../repositories/shopkeeper.repository');

class CreditService {
    async deductPoints(userId, amount) {
        const profile = await shopkeeperRepo.findByUserId(userId);
        if (!profile) throw new Error('Shopkeeper not found');

        if (profile.creditPoints < amount) {
            throw new Error('Insufficient credit points');
        }

        const updatedProfile = await shopkeeperRepo.updateCreditPoints(userId, profile.creditPoints - amount);
        if (!updatedProfile) throw new Error('Shopkeeper not found');
        return updatedProfile;
    }

    async addPointsAfterRepayment(userId, amount, isLate) {
        const profile = await shopkeeperRepo.findByUserId(userId);
        if (!profile) throw new Error('Shopkeeper not found');

        let newPoints = profile.creditPoints + amount;
        let newScore = profile.creditScore;

        if (!isLate) {
            const bonus = Math.floor(amount * 0.05);
            newPoints += bonus;
            newScore += 10;
        } else {
            const penalty = Math.floor(amount * 0.02);
            newPoints -= penalty;
            newScore -= 50;
        }

        // Update both points and score
        const updatedProfile = await shopkeeperRepo.updateProfile(userId, {
            creditPoints: newPoints,
            creditScore: newScore
        });
        if (!updatedProfile) throw new Error('Shopkeeper not found');

        return updatedProfile;
    }
}

module.exports = new CreditService();
