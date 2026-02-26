const mongoose = require('mongoose');

/**
 * Opportunity Schema - Internships, hackathons, events, scholarships
 */
const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Opportunity title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [3000, 'Description cannot exceed 3000 characters'],
        },
        type: {
            type: String,
            enum: ['internship', 'hackathon', 'event', 'scholarship', 'job', 'workshop'],
            required: true,
        },
        company: {
            type: String,
            trim: true,
            default: '',
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        link: {
            type: String,
            default: '',
        },
        deadline: {
            type: Date,
        },
        stipend: {
            type: String,
            default: '',
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        tags: [{ type: String, trim: true }],
        image: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

opportunitySchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
