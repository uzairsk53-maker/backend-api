const express = require('express');
const orderController = require('../controllers/order.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/order:
 *   post:
 *     summary: Create order
 *     tags: [Order]
 */
router.post('/', requireRole(['SHOPKEEPER']), orderController.createOrder.bind(orderController));

/**
 * @swagger
 * /api/v1/order:
 *   get:
 *     summary: Retrieve orders with pagination/filtering
 *     tags: [Order]
 */
router.get('/', orderController.getOrders.bind(orderController));

/**
 * @swagger
 * /api/v1/order/{id}:
 *   get:
 *     summary: Retrieve order by ID
 *     tags: [Order]
 */
router.get('/:id', orderController.getOrderById.bind(orderController));

/**
 * @swagger
 * /api/v1/order/{id}/status:
 *   put:
 *     summary: Update order status (Admin/Delivery)
 *     tags: [Order]
 */
router.put('/:id/status', requireRole(['ADMIN', 'DELIVERY']), orderController.updateOrderStatus.bind(orderController));

/**
 * @swagger
 * /api/v1/order/{id}/assign:
 *   put:
 *     summary: Assign delivery boy (Admin only)
 *     tags: [Order]
 */
router.put('/:id/assign', requireRole(['ADMIN']), orderController.assignDeliveryBoy.bind(orderController));

module.exports = router;
