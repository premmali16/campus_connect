const Notification = require('../models/Notification');

/**
 * Create and emit a notification
 * @param {Object} io - Socket.io instance
 * @param {Object} data - Notification data
 */
const createNotification = async (io, data) => {
    try {
        const notification = await Notification.create(data);
        const populated = await notification.populate('sender', 'name avatar');

        // Emit to recipient via socket
        if (io) {
            io.to(`notifications_${data.recipient}`).emit(
                'new_notification',
                populated
            );
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
    }
};

module.exports = { createNotification };
