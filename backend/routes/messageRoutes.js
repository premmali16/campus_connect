const express = require('express');
const router = express.Router();
const {
    getOrCreateConversation,
    getConversations,
    sendMessage,
    getMessages,
    markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/conversations', protect, getConversations);
router.post('/conversation', protect, getOrCreateConversation);
router.post('/', protect, upload.single('file'), sendMessage);
router.get('/:conversationId', protect, getMessages);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;
