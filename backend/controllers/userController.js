const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const allowedFields = [
            'name',
            'college',
            'branch',
            'year',
            'bio',
            'skills',
            'interests',
            'socialLinks',
            'avatar',
            'darkMode',
        ];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Handle file upload for avatar
        if (req.file) {
            updates.avatar = await uploadToCloudinary(req.file, 'campus-connect/avatars');
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search?q=query
 * @access  Private
 */
const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { college: { $regex: q, $options: 'i' } },
                { skills: { $in: [new RegExp(q, 'i')] } },
            ],
            _id: { $ne: req.user._id },
        })
            .select('name email avatar college branch year skills')
            .limit(20);

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users (with pagination)
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await User.countDocuments();
        const users = await User.find()
            .select('name email avatar college branch year skills points isOnline')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get leaderboard (top users by points)
 * @route   GET /api/users/leaderboard
 * @access  Private
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const users = await User.find()
            .select('name avatar college points badges')
            .sort({ points: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    searchUsers,
    getAllUsers,
    getLeaderboard,
};
