#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Shop Credit App with PostgreSQL + Prisma...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('❌ .env file not found. Please create .env file with database credentials.');
    process.exit(1);
}

// Check if DATABASE_URL is set
require('dotenv').config();
if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in .env file.');
    console.log('Please add: DATABASE_URL="postgresql://username:password@localhost:5432/shop_credit_app"');
    process.exit(1);
}

console.log('✅ Environment variables loaded');

try {
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Push schema to database (create tables)
    console.log('🔄 Creating database tables...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('✅ Database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. If you have MongoDB data to migrate, run: node src/migrations/migrate_data.js');
    console.log('2. Start the server: npm start');
    console.log('3. Test APIs with Postman collection: ShopCredit-Postman.json');

} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}