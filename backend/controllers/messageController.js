const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @desc    Get or create a 1-on-1 conversation
 * @route   POST /api/messages/conversation
 * @access  Private
 */
const getOrCreateConversation = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [req.user._id, userId], $size: 2 },
        }).populate('participants', 'name avatar isOnline lastSeen')
            .populate('lastMessage');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, userId],
                isGroup: false,
            });
            conversation = await conversation.populate('participants', 'name avatar isOnline lastSeen');
        }

        res.status(200).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate('participants', 'name avatar isOnline lastSeen')
            .populate('lastMessage')
            .populate('groupRef', 'name avatar')
            .sort({ lastMessageAt: -1 });

        res.status(200).json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
    try {
        const { conversationId, content, messageType } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        const messageData = {
            conversation: conversationId,
            sender: req.user._id,
            content,
            messageType: messageType || 'text',
            readBy: [req.user._id],
        };

        if (req.file) {
            messageData.fileUrl = await uploadToCloudinary(req.file, 'campus-connect/messages');
            messageData.fileName = req.file.originalname;
            messageData.messageType = 'file';
        }

        const message = await Message.create(messageData);
        const populated = await message.populate('sender', 'name avatar');

        // Update conversation's last message
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = Date.now();
        await conversation.save();

        res.status(201).json({
            success: true,
            data: populated,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
const getMessages = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            conversation: req.params.conversationId,
        })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({
            conversation: req.params.conversationId,
        });

        res.status(200).json({
            success: true,
            data: messages.reverse(),
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
 * @desc    Mark messages as read
 * @route   PUT /api/messages/:conversationId/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
    try {
        await Message.updateMany(
            {
                conversation: req.params.conversationId,
                readBy: { $ne: req.user._id },
            },
            { $addToSet: { readBy: req.user._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Messages marked as read',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrCreateConversation,
    getConversations,
    sendMessage,
    getMessages,
    markAsRead,
};
