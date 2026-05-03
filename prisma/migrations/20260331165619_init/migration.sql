-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SHOPKEEPER', 'DELIVERY');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('NORMAL', 'BULK', 'FAST_DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CREDIT', 'HYBRID');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'APPROVED', 'PACKED', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CLEARED', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "RepaymentStatus" AS ENUM ('ON_TIME', 'LATE', 'PENDING');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255),
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SHOPKEEPER',
    "refreshToken" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopkeepers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "shop_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "phone" VARCHAR(15),
    "email" VARCHAR(255),
    "address" TEXT,
    "city" TEXT,
    "credit_score" INTEGER NOT NULL DEFAULT 10000,
    "credit_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "shopkeepers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "bulk_price" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "shopkeeper_id" UUID NOT NULL,
    "delivery_boy_id" UUID,
    "total_price" DECIMAL(10,2) NOT NULL,
    "order_type" "OrderType" NOT NULL DEFAULT 'NORMAL',
    "credit_used" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cash_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentType" "PaymentType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "expected_delivery" TIMESTAMP(6) NOT NULL,
    "repayment_deadline" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_at_order" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" UUID NOT NULL,
    "shopkeeper_id" UUID NOT NULL,
    "order_id" UUID,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" TIMESTAMP(6),
    "status" "TransactionStatus" NOT NULL DEFAULT 'CLEARED',
    "is_penalty" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repayment_history" (
    "id" SERIAL NOT NULL,
    "shopkeeper_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "status" "RepaymentStatus" NOT NULL,
    "points_rewarded" INTEGER,
    "penalty" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "repayment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shopkeepers_user_id_key" ON "shopkeepers"("user_id");

-- AddForeignKey
ALTER TABLE "shopkeepers" ADD CONSTRAINT "shopkeepers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shopkeeper_id_fkey" FOREIGN KEY ("shopkeeper_id") REFERENCES "shopkeepers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_boy_id_fkey" FOREIGN KEY ("delivery_boy_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_shopkeeper_id_fkey" FOREIGN KEY ("shopkeeper_id") REFERENCES "shopkeepers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repayment_history" ADD CONSTRAINT "repayment_history_shopkeeper_id_fkey" FOREIGN KEY ("shopkeeper_id") REFERENCES "shopkeepers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
