const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, addressController.getAddresses);
router.post('/', protect, addressController.createAddress);
router.put('/:id', protect, addressController.updateAddress);
router.delete('/:id', protect, addressController.deleteAddress);
router.patch('/:id/default', protect, addressController.setDefaultAddress);

module.exports = router;