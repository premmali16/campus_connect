const mongoose = require('mongoose');

/**
 * Notification Schema - Real-time notifications for various events
 */
const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            enum: [
                'like',
                'comment',
                'follow',
                'group_invite',
                'group_join',
                'message',
                'mention',
                'opportunity',
                'badge',
                'system',
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            default: '',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        relatedGroup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
