const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/shop_credit_app');
const prisma = new PrismaClient();

async function migrateData() {
    try {
        await mongoClient.connect();
        const mongoDb = mongoClient.db();

        console.log('Starting data migration from MongoDB to PostgreSQL...');

        // Migrate Users
        console.log('Migrating users...');
        const users = await mongoDb.collection('users').find().toArray();
        for (const user of users) {
            await prisma.user.create({
                data: {
                    id: user._id.toString(),
                    phone: user.phone,
                    email: user.email,
                    password: user.password,
                    role: user.role || 'SHOPKEEPER',
                    refreshToken: user.refreshToken,
                    createdAt: user.createdAt || new Date(),
                    updatedAt: user.updatedAt || new Date()
                }
            });
        }
        console.log(`Migrated ${users.length} users`);

        // Migrate Shopkeepers
        console.log('Migrating shopkeepers...');
        const shopkeepers = await mongoDb.collection('shopkeepers').find().toArray();
        for (const shopkeeper of shopkeepers) {
            await prisma.shopkeeper.create({
                data: {
                    id: shopkeeper._id.toString(),
                    userId: shopkeeper.user.toString(),
                    shopName: shopkeeper.shopName,
                    ownerName: shopkeeper.ownerName,
                    phone: shopkeeper.phone,
                    email: shopkeeper.email,
                    address: shopkeeper.address,
                    city: shopkeeper.city,
                    creditScore: shopkeeper.creditScore || 10000,
                    creditPoints: shopkeeper.creditPoints || 0,
                    createdAt: shopkeeper.createdAt || new Date(),
                    updatedAt: shopkeeper.updatedAt || new Date()
                }
            });
        }
        console.log(`Migrated ${shopkeepers.length} shopkeepers`);

        // Migrate Products
        console.log('Migrating products...');
        const products = await mongoDb.collection('products').find().toArray();
        for (const product of products) {
            await prisma.product.create({
                data: {
                    id: product._id.toString(),
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    bulkPrice: product.bulkPrice,
                    stock: product.stock || 0,
                    images: product.images || [],
                    createdAt: product.createdAt || new Date(),
                    updatedAt: product.updatedAt || new Date()
                }
            });
        }
        console.log(`Migrated ${products.length} products`);

        // Migrate Orders (this would be more complex with relations)
        // For now, skipping orders as they have complex relations
        // You can add order migration logic here if needed

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Error during data migration:', error);
    } finally {
        await mongoClient.close();
        await prisma.$disconnect();
    }
}

migrateData();