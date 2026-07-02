const ActivityLog = require('../models/ActivityLog');

class ActivityService {
    /**
     * Record an activity. Fire-and-forget: never throws, so callers can log
     * without wrapping in try/catch or awaiting.
     */
    async log({ action, type = 'system', actor = 'System', actorId, role = 'system', meta } = {}) {
        try {
            if (!action) return null;
            return await ActivityLog.create({ action, type, actor, actorId, role, meta });
        } catch (err) {
            console.error('Activity log error:', err.message);
            return null;
        }
    }

    async getActivities(query = {}) {
        const { page = 1, limit = 30, type } = query;
        const filter = {};
        if (type) filter.type = type;
        const activities = await ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await ActivityLog.countDocuments(filter);
        return { activities, total, page: parseInt(page), pages: Math.ceil(total / limit) };
    }
}

module.exports = new ActivityService();
