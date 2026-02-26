const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
    try {
        const { title, content, tags, category } = req.body;

        const postData = {
            author: req.user._id,
            title,
            content,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags) : [],
            category: category || 'General',
        };

        if (req.file) {
            postData.image = `/uploads/${req.file.filename}`;
        }

        const post = await Post.create(postData);
        const populated = await post.populate('author', 'name avatar college');

        // Award points for posting
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all posts with pagination & filtering
 * @route   GET /api/posts
 * @access  Public
 */
const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { category, search, sort } = req.query;

        // Build filter
        const filter = {};
        if (category && category !== 'All') {
            filter.category = category;
        }
        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort
        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { likesCount: -1, createdAt: -1 };
        } else if (sort === 'views') {
            sortOption = { views: -1 };
        }

        const total = await Post.countDocuments(filter);
        const posts = await Post.find(filter)
            .populate('author', 'name avatar college')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: posts,
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
 * @desc    Get single post
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getPost = async (req, res, next) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('author', 'name avatar college branch year');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        // Get comments for this post
        const comments = await Comment.find({ post: post._id })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { ...post.toObject(), comments },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private (owner only)
 */
const updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        // Check ownership
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post',
            });
        }

        const updates = {};
        if (req.body.title) updates.title = req.body.title;
        if (req.body.content) updates.content = req.body.content;
        if (req.body.tags) updates.tags = typeof req.body.tags === 'string' ? req.body.tags.split(',').map((t) => t.trim()) : req.body.tags;
        if (req.body.category) updates.category = req.body.category;
        if (req.file) updates.image = `/uploads/${req.file.filename}`;

        post = await Post.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).populate('author', 'name avatar college');

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private (owner or admin)
 */
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post',
            });
        }

        // Delete associated comments
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Like/Unlike a post
 * @route   PUT /api/posts/:id/like
 * @access  Private
 */
const likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        const isLiked = post.likes.includes(req.user._id);

        if (isLiked) {
            post.likes.pull(req.user._id);
            post.likesCount = Math.max(0, post.likesCount - 1);
        } else {
            post.likes.push(req.user._id);
            post.likesCount += 1;

            // Award points to post author for receiving a like
            if (post.author.toString() !== req.user._id.toString()) {
                await User.findByIdAndUpdate(post.author, { $inc: { points: 1 } });
            }
        }

        await post.save();

        res.status(200).json({
            success: true,
            data: {
                likes: post.likes,
                likesCount: post.likesCount,
                isLiked: !isLiked,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        const comment = await Comment.create({
            post: post._id,
            author: req.user._id,
            content: req.body.content,
            parentComment: req.body.parentComment || null,
        });

        // Update comments count
        post.commentsCount += 1;
        await post.save();

        const populated = await comment.populate('author', 'name avatar');

        // Award points
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 2 } });

        res.status(201).json({
            success: true,
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }

        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        await Post.findByIdAndUpdate(comment.post, {
            $inc: { commentsCount: -1 },
        });

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Comment deleted',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get trending posts
 * @route   GET /api/posts/trending
 * @access  Public
 */
const getTrendingPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name avatar college')
            .sort({ likesCount: -1, views: -1, commentsCount: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: posts,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    deleteComment,
    getTrendingPosts,
};
