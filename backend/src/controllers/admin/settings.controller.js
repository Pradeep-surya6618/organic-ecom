const StoreSetting = require('../../models/StoreSetting');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.getSettings = asyncHandler(async (req, res) => {
    const { group } = req.query;
    const filter = group ? { group } : {};
    const settings = await StoreSetting.find(filter);
    res.json(new ApiResponse(200, settings, 'Settings fetched'));
});

exports.getSetting = asyncHandler(async (req, res) => {
    const setting = await StoreSetting.findOne({ key: req.params.key });
    res.json(new ApiResponse(200, setting, 'Setting fetched'));
});

exports.updateSetting = asyncHandler(async (req, res) => {
    const { key, value, group, description } = req.body;
    const setting = await StoreSetting.findOneAndUpdate(
        { key },
        { key, value, group, description },
        { new: true, upsert: true }
    );
    res.json(new ApiResponse(200, setting, 'Setting updated'));
});

exports.deleteSetting = asyncHandler(async (req, res) => {
    await StoreSetting.findOneAndDelete({ key: req.params.key });
    res.json(new ApiResponse(200, null, 'Setting deleted'));
});