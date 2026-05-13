const express = require('express');
const deliveryController = require('../controllers/delivery.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);

// Delivery Boy Profile (Accessible by DELIVERY role)
router.get('/profile', requireRole(['DELIVERY']), deliveryController.getProfile.bind(deliveryController));
router.put('/profile', requireRole(['DELIVERY']), deliveryController.updateProfile.bind(deliveryController));
router.put('/location', requireRole(['DELIVERY']), deliveryController.updateLocation.bind(deliveryController));

// Admin routes
router.post('/', requireRole(['ADMIN']), deliveryController.createDeliveryBoy.bind(deliveryController));
router.get('/', requireRole(['ADMIN']), deliveryController.getDeliveryBoys.bind(deliveryController));

module.exports = router;
