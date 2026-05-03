const redis = require('redis');

let redisClient;

if (process.env.REDIS_ENABLED === 'true') {

    redisClient = redis.createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });

    redisClient.on('error', (err) => {
        console.log('Redis Client Error (Service Optional)', err.message);
    });

    (async () => {
        try {
            await redisClient.connect();
            console.log('Redis Connected');
        } catch (err) {
            console.error('Redis connection failed:', err.message);
        }
    })();

} else {
    console.log('Redis Disabled via ENV');
    
    // dummy client (avoid crash in other files)
    redisClient = {
        get: async () => null,
        set: async () => null,
        del: async () => null,
        connect: async () => {},
        on: () => {}
    };
}

module.exports = redisClient;
