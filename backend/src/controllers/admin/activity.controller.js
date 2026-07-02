const activityService = require('../../services/activity.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

exports.getActivities = asyncHandler(async (req, res) => {
    const result = await activityService.getActivities(req.query);
    res.json(new ApiResponse(200, result, 'Activities fetched'));
});
