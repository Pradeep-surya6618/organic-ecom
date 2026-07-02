const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class UserService {
    async getProfile(userId) {
        const user = await User.findById(userId).select('-password -otp -resetPasswordToken -resetPasswordExpire');
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }

    async updateProfile(userId, updateData) {
        const allowed = ['fullName', 'preferences'];
        const updates = {};
        allowed.forEach(key => { if (updateData[key] !== undefined) updates[key] = updateData[key]; });
        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password -otp');
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }

    async getAllUsers(query = {}) {
        const { page = 1, limit = 10, role, search } = query;
        const filter = {};
        if (role) filter.role = role;
        if (search) filter.$or = [{ fullName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
        const users = await User.find(filter).select('-password -otp').skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await User.countDocuments(filter);
        return { users, total, page: parseInt(page), pages: Math.ceil(total / limit) };
    }

    async toggleUserStatus(userId) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, 'User not found');
        user.isActive = !user.isActive;
        await user.save();
        return user;
    }
}
module.exports = new UserService();