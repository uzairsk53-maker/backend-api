const express = require('express');
const creditController = require('../controllers/credit.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['ADMIN', 'DELIVERY']));

/**
 * @swagger
 * /api/v1/credit/repayment:
 *   post:
 *     summary: Manual repayment confirmation
 *     tags: [Credit]
 */
router.post('/repayment', creditController.manualRepayment.bind(creditController));

module.exports = router;
