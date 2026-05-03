const { Queue, Worker } = require('bullmq');
const redisClient = require('../config/redis');
const { prisma } = require('../config/db');
const creditService = require('../services/credit.service');

let repaymentQueue;
let worker;

if (process.env.REDIS_ENABLED === 'true') {
    repaymentQueue = new Queue('repayment-check', { connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    } });

    repaymentQueue.on('error', (err) => {
        console.log('BullMQ Queue Error (Redis Offline?):', err.message);
    });

    // Run the job daily at midnight
    repaymentQueue.add('checkRepayments', {}, { repeat: { cron: '0 0 * * *' } });

    worker = new Worker('repayment-check', async (job) => {
        console.log('Running Repayment Worker...');
        
        // Find orders with CREDIT usage that are past deadline and status is not yet fulfilled or repayment marked
        const dateNow = new Date();
        
        // Simplistic example: We check if there are any orders past deadline. 
        // In actual implementation, we'd have a specific "PAID" status or similar field for credit repayment.
        const overdueOrders = await prisma.order.findMany({
            where: {
                creditUsed: { gt: 0 },
                repaymentDeadline: { lt: dateNow },
                // assuming status not modified to "REPAID" yet
            }
        });

        for (const order of overdueOrders) {
            // Apply penalty for each late order
            try {
                await creditService.addPointsAfterRepayment(order.shopkeeperId, 0, true);
                console.log(`Penalty applied to shopkeeper: ${order.shopkeeperId} for order ${order.id}`);
                
                // Optionally update order deadline so we don't apply penalty again tomorrow
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        repaymentDeadline: new Date(dateNow.getTime() + 7 * 24 * 60 * 60 * 1000) // give them another 7 days? or mark as penalized
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    }, { connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    } });

    worker.on('error', (err) => {
        console.log('BullMQ Worker Error (Redis Offline?):', err.message);
    });

    worker.on('completed', job => {
        console.log(`Job with id ${job.id} has been completed`);
    });

    worker.on('failed', (job, err) => {
        console.error(`Job with id ${job.id} has failed with ${err.message}`);
    });
} else {
    console.log('BullMQ Workers Disabled (Redis not enabled)');
    // Dummy objects
    repaymentQueue = {
        add: async () => {},
        on: () => {}
    };
    worker = {
        on: () => {}
    };
}

module.exports = { repaymentQueue, worker };
