const express = require('express');
const router = express.Router();
const {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    deleteComment,
    getTrendingPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/trending', getTrendingPosts);
router.get('/', getPosts);
router.get('/:id', getPost);

router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);

router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
