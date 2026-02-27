const Resource = require('../models/Resource');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @desc    Upload/Create a resource
 * @route   POST /api/resources
 * @access  Private
 */
const createResource = async (req, res, next) => {
    try {
        const { title, description, type, subject, category, externalLink, tags } = req.body;

        const resourceData = {
            title,
            description,
            type,
            subject,
            category: category || 'Other',
            externalLink: externalLink || '',
            uploadedBy: req.user._id,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags) : [],
        };

        if (req.file) {
            resourceData.fileUrl = await uploadToCloudinary(req.file, 'campus-connect/resources');
        }

        const resource = await Resource.create(resourceData);
        const populated = await resource.populate('uploadedBy', 'name avatar');

        // Award points for sharing resources
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 8 } });

        res.status(201).json({
            success: true,
            message: 'Resource uploaded successfully',
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all resources
 * @route   GET /api/resources
 * @access  Private
 */
const getResources = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const { category, type, search, sort } = req.query;

        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (type && type !== 'All') filter.type = type;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { downloads: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };

        const total = await Resource.countDocuments(filter);
        const resources = await Resource.find(filter)
            .populate('uploadedBy', 'name avatar college')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: resources,
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
 * @desc    Get single resource
 * @route   GET /api/resources/:id
 * @access  Private
 */
const getResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id).populate(
            'uploadedBy',
            'name avatar college'
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        res.status(200).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download/increment download counter
 * @route   PUT /api/resources/:id/download
 * @access  Private
 */
const downloadResource = async (req, res, next) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloads: 1 } },
            { new: true }
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        res.status(200).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Rate a resource
 * @route   PUT /api/resources/:id/rate
 * @access  Private
 */
const rateResource = async (req, res, next) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        // Check if user already rated
        const existingRating = resource.ratings.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (existingRating) {
            existingRating.rating = rating;
        } else {
            resource.ratings.push({ user: req.user._id, rating });
        }

        // Calculate average rating
        const totalRating = resource.ratings.reduce((acc, r) => acc + r.rating, 0);
        resource.averageRating = (totalRating / resource.ratings.length).toFixed(1);

        await resource.save();

        res.status(200).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private (owner or admin)
 */
const deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        if (
            resource.uploadedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        await resource.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Resource deleted',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createResource,
    getResources,
    getResource,
    downloadResource,
    rateResource,
    deleteResource,
};
