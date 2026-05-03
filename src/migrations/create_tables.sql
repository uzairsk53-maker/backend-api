-- Migration script to create PostgreSQL tables for Shop Credit App

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'SHOPKEEPER', 'DELIVERY')) NOT NULL,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopkeepers Table
CREATE TABLE shopkeepers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    city TEXT,
    credit_score INT DEFAULT 10000,
    credit_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repayment History Table
CREATE TABLE repayment_history (
    id SERIAL PRIMARY KEY,
    shopkeeper_id UUID REFERENCES shopkeepers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ON_TIME', 'LATE', 'PENDING')) NOT NULL,
    points_rewarded INT,
    penalty NUMERIC(10, 2)
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    bulk_price NUMERIC(10, 2),
    stock INT DEFAULT 0,
    images TEXT[]
);