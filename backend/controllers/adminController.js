const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const Resource = require('../models/Resource');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');

/**
 * @desc    Get admin dashboard analytics
 * @route   GET /api/admin/analytics
 * @access  Private (admin only)
 */
const getAnalytics = async (req, res, next) => {
    try {
        const [totalUsers, totalPosts, totalGroups, totalResources, totalOpportunities] =
            await Promise.all([
                User.countDocuments(),
                Post.countDocuments(),
                Group.countDocuments(),
                Resource.countDocuments(),
                Opportunity.countDocuments(),
            ]);

        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        // Users by role
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Monthly growth data (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const start = new Date();
            start.setMonth(start.getMonth() - i, 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);

            const users = await User.countDocuments({
                createdAt: { $gte: start, $lt: end },
            });
            const posts = await Post.countDocuments({
                createdAt: { $gte: start, $lt: end },
            });

            monthlyData.push({
                month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
                users,
                posts,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                totalGroups,
                totalResources,
                totalOpportunities,
                newUsersThisWeek,
                adminCount,
                studentCount: totalUsers - adminCount,
                monthlyData,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users for admin management
 * @route   GET /api/admin/users
 * @access  Private (admin only)
 */
const getAdminUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { search, role } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (role) filter.role = role;

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password')
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
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (admin only)
 */
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (admin only)
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Delete user's posts
        await Post.deleteMany({ author: user._id });
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User and associated data deleted',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all posts for admin management
 * @route   GET /api/admin/posts
 * @access  Private (admin only)
 */
const getAdminPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Post.countDocuments();
        const posts = await Post.find()
            .populate('author', 'name avatar college')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a post (admin)
 * @route   DELETE /api/admin/posts/:id
 * @access  Private (admin only)
 */
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();
        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnalytics,
    getAdminUsers,
    getAdminPosts,
    updateUserRole,
    deleteUser,
    deletePost,
};
