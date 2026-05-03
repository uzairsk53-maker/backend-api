const { Queue, Worker } = require('bullmq');
const redisClient = require('../../config/redis'); // Reusing ioredis if adapted
const CreditTransaction = require('../../models/CreditTransaction');
const Shopkeeper = require('../../models/Shopkeeper');

let penaltyQueue;

if (process.env.REDIS_ENABLED === 'true') {
    // Creating BullMQ Queue for penalty engine
    penaltyQueue = new Queue('credit-penalty', {
        connection: { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT || 6379 }
    });

    // Create Worker
    const penaltyWorker = new Worker('credit-penalty', async (job) => {
        const { txId } = job.data;
        const tx = await CreditTransaction.findById(txId);
        
        if (tx && tx.status === 'PENDING') {
            const penaltyAmount = tx.amount * 0.05; // 5% Penalty
            
            tx.status = 'OVERDUE';
            tx.isPenalty = true;
            await tx.save();
            
            // Add additional penalty transaction or update current amount logic
            await CreditTransaction.create({
                 shopkeeperId: tx.shopkeeperId,
                 type: 'DEBIT',
                 amount: penaltyAmount,
                 orderId: tx.orderId,
                 status: 'OVERDUE',
                 isPenalty: true,
                 message: 'Late repayment penalty'
            });

            // Reduce credit score
            const shopkeeper = await Shopkeeper.findById(tx.shopkeeperId);
            shopkeeper.creditScore = Math.max(0, shopkeeper.creditScore - 50); // Severe impact for defaults
            await shopkeeper.save();

            console.log(`Penalty 5% processed for tx ${txId}`);
        }
    }, { connection: { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT || 6379 }});

    penaltyWorker.on('completed', job => {
        console.log(`Job with id ${job.id} has been completed`);
    });
    penaltyWorker.on('failed', (job, err) => {
        console.log(`Job with id ${job.id} has failed with ${err.message}`);
    });
} else {
    console.log('BullMQ Penalty Queue Disabled (Redis not enabled)');
    // Dummy queue
    penaltyQueue = {
        add: async () => {},
        on: () => {}
    };
}

module.exports = { penaltyQueue };
