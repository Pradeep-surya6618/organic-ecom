const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, wishlistController.getWishlist);
router.post('/add', protect, wishlistController.addToWishlist);
router.delete('/remove/:productId', protect, wishlistController.removeFromWishlist);

module.exports = router;