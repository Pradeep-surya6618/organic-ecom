const Address = require('../models/Address');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.getAddresses = asyncHandler(async (req, res) => {
    const addresses = await Address.find({ user: req.user._id });
    res.json(new ApiResponse(200, addresses, 'Addresses fetched'));
});

exports.createAddress = asyncHandler(async (req, res) => {
    const address = await Address.create({ ...req.body, user: req.user._id });
    res.status(201).json(new ApiResponse(201, address, 'Address created'));
});

exports.updateAddress = asyncHandler(async (req, res) => {
    const address = await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    res.json(new ApiResponse(200, address, 'Address updated'));
});

exports.deleteAddress = asyncHandler(async (req, res) => {
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json(new ApiResponse(200, null, 'Address deleted'));
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id }, { isDefault: true }, { new: true }
    );
    res.json(new ApiResponse(200, address, 'Default address set'));
});