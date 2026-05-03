const express = require('express');
const productController = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/product:
 *   get:
 *     summary: Retrieve product list (public or logged in based on policy, assuming logged in)
 *     tags: [Product]
 */
router.get('/', verifyToken, productController.getProductList.bind(productController));

// Admin operations
router.post('/', verifyToken, requireRole(['ADMIN']), productController.addProduct.bind(productController));
router.put('/:id', verifyToken, requireRole(['ADMIN']), productController.updateProduct.bind(productController));
router.delete('/:id', verifyToken, requireRole(['ADMIN']), productController.deleteProduct.bind(productController));

module.exports = router;
