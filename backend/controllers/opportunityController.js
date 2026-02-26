const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

/**
 * @desc    Create an opportunity
 * @route   POST /api/opportunities
 * @access  Private
 */
const createOpportunity = async (req, res, next) => {
    try {
        const { title, description, type, company, location, link, deadline, stipend, tags } = req.body;

        const opportunityData = {
            title,
            description,
            type,
            company,
            location,
            link,
            deadline: deadline ? new Date(deadline) : undefined,
            stipend,
            postedBy: req.user._id,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags) : [],
        };

        if (req.file) {
            opportunityData.image = `/uploads/${req.file.filename}`;
        }

        const opportunity = await Opportunity.create(opportunityData);
        const populated = await opportunity.populate('postedBy', 'name avatar');

        // Award points
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });

        res.status(201).json({
            success: true,
            message: 'Opportunity posted successfully',
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all opportunities
 * @route   GET /api/opportunities
 * @access  Private
 */
const getOpportunities = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const { type, search } = req.query;

        const filter = { isApproved: true };
        if (type && type !== 'All') filter.type = type;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Opportunity.countDocuments(filter);
        const opportunities = await Opportunity.find(filter)
            .populate('postedBy', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: opportunities,
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
 * @desc    Get single opportunity
 * @route   GET /api/opportunities/:id
 * @access  Private
 */
const getOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('postedBy', 'name avatar college');

        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found',
            });
        }

        res.status(200).json({
            success: true,
            data: opportunity,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Apply to an opportunity
 * @route   PUT /api/opportunities/:id/apply
 * @access  Private
 */
const applyOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found',
            });
        }

        if (opportunity.applicants.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Already applied',
            });
        }

        opportunity.applicants.push(req.user._id);
        await opportunity.save();

        res.status(200).json({
            success: true,
            message: 'Applied successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Save/unsave an opportunity
 * @route   PUT /api/opportunities/:id/save
 * @access  Private
 */
const saveOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found',
            });
        }

        const user = await User.findById(req.user._id);
        const isSaved = user.savedOpportunities.includes(opportunity._id);

        if (isSaved) {
            user.savedOpportunities.pull(opportunity._id);
            opportunity.savedBy.pull(req.user._id);
        } else {
            user.savedOpportunities.push(opportunity._id);
            opportunity.savedBy.push(req.user._id);
        }

        await user.save();
        await opportunity.save();

        res.status(200).json({
            success: true,
            message: isSaved ? 'Unsaved' : 'Saved',
            isSaved: !isSaved,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete opportunity
 * @route   DELETE /api/opportunities/:id
 * @access  Private (owner or admin)
 */
const deleteOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found',
            });
        }

        if (
            opportunity.postedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        await opportunity.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Opportunity deleted',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOpportunity,
    getOpportunities,
    getOpportunity,
    applyOpportunity,
    saveOpportunity,
    deleteOpportunity,
};
