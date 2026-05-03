const productRepo = require('../repositories/product.repository');
const redisClient = require('../config/redis');

class ProductService {
    constructor() {
        this.cachePrefix = 'products:';
        this.cacheTTL = 3600; // 1 hour
    }

    async addProduct(data) {
        const product = await productRepo.create(data);
        await this.invalidateCache();
        return product;
    }

    async updateProduct(id, data) {
        const product = await productRepo.update(id, data);
        if (!product) throw new Error('Product not found');
        await this.invalidateCache();
        return product;
    }

    async deleteProduct(id) {
        const product = await productRepo.delete(id);
        if (!product) throw new Error('Product not found');
        await this.invalidateCache();
        return product;
    }

    // Map productImages relation → flat images[] array so consumers get URLs directly
    _normalize(product) {
        if (!product) return product;
        const imgs = product.productImages || [];
        return {
            ...product,
            images: imgs.map(img => img.url),      // flat URL array
            productImages: imgs,                    // keep original for admin use
        };
    }

    async getProductList(query) {
        const { page = 1, limit = 10, search, category } = query;
        const skip = (page - 1) * limit;

        const cacheKey = `${this.cachePrefix}${page}:${limit}:${search || ''}:${category || ''}`;
        
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        } catch (err) {
            console.error('Redis Error', err);
        }

        let products, total;

        if (search) {
            products = await productRepo.searchProducts(search, skip, parseInt(limit));
            total = await productRepo.countDocuments({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } }
                ]
            });
        } else {
            const filter = {};
            if (category) filter.category = category;
            products = await productRepo.findAll(filter, skip, parseInt(limit));
            total = await productRepo.countDocuments(filter);
        }

        // Normalize: map productImages → images[]
        const normalizedProducts = products.map(p => this._normalize(p));

        const result = {
            products: normalizedProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total
        };

        try {
            await redisClient.setEx(cacheKey, this.cacheTTL, JSON.stringify(result));
        } catch (err) {
            console.error('Redis Set Error', err);
        }

        return result;
    }


    async invalidateCache() {
        try {
             const keys = await redisClient.keys(`${this.cachePrefix}*`);
             if (keys.length > 0) {
                 await redisClient.del(keys);
             }
        } catch (err) {
             console.error('Redis Invalidation Error', err);
        }
    }
}

module.exports = new ProductService();
