const express = require('express');

const authRoutes = require('./auth.routes');
const shopkeeperRoutes = require('./shopkeeper.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const creditRoutes = require('./credit.routes');
const adminRoutes = require('./admin.routes');
const deliveryRoutes = require('./delivery.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/shopkeeper', shopkeeperRoutes);
router.use('/product', productRoutes);
router.use('/order', orderRoutes);
router.use('/credit', creditRoutes);
router.use('/admin', adminRoutes);
router.use('/delivery', deliveryRoutes);

module.exports = router;
