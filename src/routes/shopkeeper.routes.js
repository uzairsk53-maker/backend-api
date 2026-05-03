const express = require('express');
const shopkeeperController = require('../controllers/shopkeeper.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['SHOPKEEPER']));

/**
 * @swagger
 * /api/v1/shopkeeper/dashboard:
 *   get:
 *     summary: Get shopkeeper dashboard data
 *     tags: [Shopkeeper]
 */
router.get('/dashboard', shopkeeperController.getDashboard.bind(shopkeeperController));

/**
 * @swagger
 * /api/v1/shopkeeper/profile:
 *   put:
 *     summary: Update profile
 *     tags: [Shopkeeper]
 */
router.put('/profile', shopkeeperController.updateProfile.bind(shopkeeperController));

module.exports = router;
