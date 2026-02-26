const mongoose = require('mongoose');

/**
 * Resource Schema - Shared educational resources (notes, PDFs, links)
 * Supports ratings and categorization
 */
const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Resource title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
            default: '',
        },
        type: {
            type: String,
            enum: ['notes', 'pdf', 'link', 'video', 'other'],
            required: true,
        },
        fileUrl: {
            type: String,
            default: '',
        },
        externalLink: {
            type: String,
            default: '',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        category: {
            type: String,
            enum: [
                'Mathematics',
                'Physics',
                'Chemistry',
                'Computer Science',
                'Electronics',
                'Mechanical',
                'Civil',
                'Other',
            ],
            default: 'Other',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        downloads: {
            type: Number,
            default: 0,
        },
        ratings: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                rating: { type: Number, min: 1, max: 5 },
            },
        ],
        averageRating: {
            type: Number,
            default: 0,
        },
        tags: [{ type: String, trim: true }],
    },
    {
        timestamps: true,
    }
);

resourceSchema.index({ title: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
