const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let storage;

// Use Cloudinary if configured, otherwise fallback to local disk
if (process.env.CLOUDINARY_CLOUD_NAME) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'shop_uzair_products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });
} else {
  console.warn("⚠️ CLOUDINARY_CLOUD_NAME is missing! Falling back to local storage which will BE DELETED by Render!");
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
  });
}

const upload = multer({ storage });
const memoryUpload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);
router.use(requireRole(['ADMIN']));

router.get('/dashboard/summary', adminController.getDashboardSummary.bind(adminController));
router.get('/dashboard/revenue-graph', adminController.getRevenueGraph.bind(adminController));
router.get('/dashboard/recent-orders', adminController.getRecentOrders.bind(adminController));

router.get('/products', adminController.getProducts.bind(adminController));
router.get('/products/:id', adminController.getProductById.bind(adminController));
router.post('/products', upload.array('images', 10), adminController.createProduct.bind(adminController));
router.put('/products/:id', adminController.updateProduct.bind(adminController));
router.delete('/products/:id', adminController.deleteProduct.bind(adminController));
router.post('/products/bulk-upload', memoryUpload.single('file'), adminController.bulkUploadProducts.bind(adminController));
router.post('/products/upload-images', upload.array('images', 10), adminController.uploadImages.bind(adminController));

router.get('/orders', adminController.getOrders.bind(adminController));
router.get('/orders/:id', adminController.getOrderById.bind(adminController));
router.put('/orders/:id/approve', adminController.approveOrder.bind(adminController));
router.put('/orders/:id/assign-delivery-boy', adminController.assignDeliveryBoy.bind(adminController));
router.put('/orders/:id/status', adminController.updateOrderStatus.bind(adminController));
router.put('/orders/:id/cancel', adminController.cancelOrder.bind(adminController));

router.get('/shopkeepers', adminController.getShopkeepers.bind(adminController));
router.get('/shopkeepers/:id', adminController.getShopkeeperById.bind(adminController));
router.put('/shopkeepers/:id', adminController.updateShopkeeper.bind(adminController));
router.put('/shopkeepers/:id/block', adminController.blockShopkeeper.bind(adminController));
router.put('/shopkeepers/:id/unblock', adminController.unblockShopkeeper.bind(adminController));
router.put('/shopkeepers/:id/reset-credit-score', adminController.resetCreditScore.bind(adminController));
router.get('/shopkeepers/:id/history', adminController.getShopkeeperHistory.bind(adminController));
router.get('/shopkeepers/:id/orders', adminController.getShopkeeperOrders.bind(adminController));

router.get('/credit/settings', adminController.getCreditSettings.bind(adminController));
router.put('/credit/settings', adminController.updateCreditSettings.bind(adminController));
router.get('/credit/penalty-rules', adminController.getPenaltyRules.bind(adminController));
router.post('/credit/penalty-rules', adminController.createPenaltyRule.bind(adminController));
router.put('/credit/penalty-rules/:id', adminController.updatePenaltyRule.bind(adminController));
router.delete('/credit/penalty-rules/:id', adminController.deletePenaltyRule.bind(adminController));
router.get('/credit/bonus-rules', adminController.getBonusRules.bind(adminController));
router.post('/credit/bonus-rules', adminController.createBonusRule.bind(adminController));
router.put('/credit/bonus-rules/:id', adminController.updateBonusRule.bind(adminController));
router.delete('/credit/bonus-rules/:id', adminController.deleteBonusRule.bind(adminController));
router.post('/credit/manual-adjustment', adminController.manualAdjustment.bind(adminController));
router.get('/credit/transactions', adminController.getCreditTransactions.bind(adminController));

router.get('/delivery-boys', adminController.getDeliveryBoys.bind(adminController));
router.post('/delivery-boys', adminController.createDeliveryBoy.bind(adminController));
router.put('/delivery-boys/:id', adminController.updateDeliveryBoy.bind(adminController));
router.get('/deliveries', adminController.getDeliveries.bind(adminController));
router.put('/deliveries/:id/assign', adminController.assignDelivery.bind(adminController));
router.put('/deliveries/:id/status', adminController.updateDeliveryStatus.bind(adminController));
router.post('/repayments/manual-confirmation', adminController.manualRepaymentConfirmation.bind(adminController));

module.exports = router;
