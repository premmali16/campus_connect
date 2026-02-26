const mongoose = require('mongoose');

/**
 * Post Schema - Community discussion posts
 * Supports likes, comments, tags, and categories
 */
const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            maxlength: [5000, 'Post cannot exceed 5000 characters'],
        },
        title: {
            type: String,
            required: [true, 'Post title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        image: {
            type: String,
            default: '',
        },
        tags: [{ type: String, trim: true, lowercase: true }],
        category: {
            type: String,
            enum: [
                'General',
                'Academic',
                'Technical',
                'Career',
                'Events',
                'Projects',
                'Doubts',
                'Announcements',
            ],
            default: 'General',
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        isPinned: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Index for search and sorting
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ likesCount: -1 });

module.exports = mongoose.model('Post', postSchema);
