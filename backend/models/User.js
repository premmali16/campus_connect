const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema - Core user model with profile information
 * Supports student and admin roles
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        avatar: {
            type: String,
            default: '',
        },
        college: {
            type: String,
            trim: true,
            default: '',
        },
        branch: {
            type: String,
            trim: true,
            default: '',
        },
        year: {
            type: String,
            enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', ''],
            default: '',
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            default: '',
        },
        skills: [{ type: String, trim: true }],
        interests: [{ type: String, trim: true }],
        socialLinks: {
            github: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            twitter: { type: String, default: '' },
            portfolio: { type: String, default: '' },
        },
        points: {
            type: Number,
            default: 0,
        },
        badges: [
            {
                name: String,
                icon: String,
                earnedAt: { type: Date, default: Date.now },
            },
        ],
        savedOpportunities: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
        ],
        isOnline: {
            type: Boolean,
            default: false,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        darkMode: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
