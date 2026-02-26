const mongoose = require('mongoose');

/**
 * Group Schema - Study groups with chat and file sharing
 */
const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Group name is required'],
            trim: true,
            maxlength: [100, 'Group name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        category: {
            type: String,
            enum: [
                'Study',
                'Project',
                'Club',
                'Sports',
                'Cultural',
                'Technical',
                'Other',
            ],
            default: 'Study',
        },
        tags: [{ type: String, trim: true }],
        isPrivate: {
            type: Boolean,
            default: false,
        },
        maxMembers: {
            type: Number,
            default: 50,
        },
        files: [
            {
                name: String,
                url: String,
                uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

groupSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Group', groupSchema);
