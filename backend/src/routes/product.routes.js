const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeatured);
router.get('/:id', productController.getProduct);
router.post('/', protect, requireAdmin, productController.createProduct);
router.put('/:id', protect, requireAdmin, productController.updateProduct);
router.delete('/:id', protect, requireAdmin, productController.deleteProduct);

module.exports = router;