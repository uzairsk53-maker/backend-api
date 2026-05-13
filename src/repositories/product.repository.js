
const { prisma } = require('../config/db');

class ProductRepository {
    async create(data) {
        return await prisma.product.create({
            data: {
                name: data.name,
                category: data.category,
                price: data.price,
                bulkPrice: data.bulkPrice,
                stock: data.stock,
                images: data.images || []
            }
        });
    }

    async update(id, data) {
        return await prisma.product.update({
            where: { id: id },
            data: {
                name: data.name,
                category: data.category,
                price: data.price,
                bulkPrice: data.bulkPrice,
                stock: data.stock,
                images: data.images
            }
        });
    }

    async delete(id) {
        return await prisma.product.delete({
            where: { id: id }
        });
    }

    async findAll(filter = {}, skip = 0, limit = 10, sort = 'createdAt') {
        const orderBy = sort.includes('DESC') ? { [sort.replace(' DESC', '')]: 'desc' } : { [sort]: 'asc' };

        return await prisma.product.findMany({
            where: filter,
            skip: skip,
            take: limit,
            orderBy: orderBy,
            include: { productImages: { orderBy: { sortOrder: 'asc' } } }
        });
    }

    async countDocuments(filter = {}) {
        return await prisma.product.count({
            where: filter
        });
    }

    async findById(id) {
        return await prisma.product.findUnique({
            where: { id: id },
            include: { productImages: { orderBy: { sortOrder: 'asc' } } }
        });
    }

    async searchProducts(searchTerm, skip = 0, limit = 10) {
        return await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { category: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            skip: skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { productImages: { orderBy: { sortOrder: 'asc' } } }
        });
    }
}

module.exports = new ProductRepository();
