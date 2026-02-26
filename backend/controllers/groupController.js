const Group = require('../models/Group');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * @desc    Create a study group
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = async (req, res, next) => {
    try {
        const { name, description, category, tags, isPrivate, maxMembers } = req.body;

        const group = await Group.create({
            name,
            description,
            category,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags) : [],
            isPrivate: isPrivate || false,
            maxMembers: maxMembers || 50,
            creator: req.user._id,
            admins: [req.user._id],
            members: [req.user._id],
        });

        if (req.file) {
            group.avatar = `/uploads/${req.file.filename}`;
            await group.save();
        }

        // Create a conversation for the group chat
        await Conversation.create({
            participants: [req.user._id],
            isGroup: true,
            groupRef: group._id,
        });

        const populated = await group.populate('members', 'name avatar');

        // Award points
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all groups
 * @route   GET /api/groups
 * @access  Private
 */
const getGroups = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const { category, search } = req.query;

        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Group.countDocuments(filter);
        const groups = await Group.find(filter)
            .populate('creator', 'name avatar')
            .populate('members', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: groups,
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
 * @desc    Get single group
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('creator', 'name avatar college')
            .populate('members', 'name avatar college branch year')
            .populate('admins', 'name avatar');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }

        res.status(200).json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Join a group
 * @route   PUT /api/groups/:id/join
 * @access  Private
 */
const joinGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }

        if (group.members.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Already a member of this group',
            });
        }

        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({
                success: false,
                message: 'Group is full',
            });
        }

        group.members.push(req.user._id);
        await group.save();

        // Add user to group conversation
        await Conversation.findOneAndUpdate(
            { groupRef: group._id },
            { $addToSet: { participants: req.user._id } }
        );

        const populated = await group.populate('members', 'name avatar');

        res.status(200).json({
            success: true,
            message: 'Joined group successfully',
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Leave a group
 * @route   PUT /api/groups/:id/leave
 * @access  Private
 */
const leaveGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }

        if (!group.members.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Not a member of this group',
            });
        }

        // Can't leave if you're the creator
        if (group.creator.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Creator cannot leave the group. Delete it instead.',
            });
        }

        group.members.pull(req.user._id);
        group.admins.pull(req.user._id);
        await group.save();

        // Remove user from group conversation
        await Conversation.findOneAndUpdate(
            { groupRef: group._id },
            { $pull: { participants: req.user._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Left group successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (creator or admin)
 */
const deleteGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
            });
        }

        if (
            group.creator.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this group',
            });
        }

        // Delete associated conversation
        await Conversation.findOneAndDelete({ groupRef: group._id });
        await group.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get groups the current user is a member of
 * @route   GET /api/groups/my-groups
 * @access  Private
 */
const getMyGroups = async (req, res, next) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('creator', 'name avatar')
            .populate('members', 'name avatar')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGroup,
    getGroups,
    getGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    getMyGroups,
};
