const express = require('express');
const deliveryController = require('../controllers/delivery.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['ADMIN'])); // Only admin can CRUD delivery boys

/**
 * @swagger
 * /api/v1/delivery:
 *   post:
 *     summary: Create new delivery boy
 *     tags: [Delivery]
 */
router.post('/', deliveryController.createDeliveryBoy.bind(deliveryController));

/**
 * @swagger
 * /api/v1/delivery:
 *   get:
 *     summary: View list of delivery boys
 *     tags: [Delivery]
 */
router.get('/', deliveryController.getDeliveryBoys.bind(deliveryController));

module.exports = router;
