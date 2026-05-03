const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register-shopkeeper:
 *   post:
 *     summary: Register a new shopkeeper
 *     tags: [Auth]
 */
router.post('/register-shopkeeper', authController.registerShopkeeper.bind(authController));

/**
 * @swagger
 * /api/v1/auth/register-admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Auth]
 */
router.post('/register-admin', authController.registerAdmin.bind(authController));

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login for all roles (ADMIN, SHOPKEEPER, DELIVERY)
 *     tags: [Auth]
 */
router.post('/login', authController.login.bind(authController));

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh JWT tokens
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh.bind(authController));

module.exports = router;
