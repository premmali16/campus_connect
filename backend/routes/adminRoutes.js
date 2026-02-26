const express = require('express');
const router = express.Router();
const {
    getAnalytics,
    getAdminUsers,
    getAdminPosts,
    updateUserRole,
    deleteUser,
    deletePost,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/users', protect, authorize('admin'), getAdminUsers);
router.get('/posts', protect, authorize('admin'), getAdminPosts);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.delete('/posts/:id', protect, authorize('admin'), deletePost);

module.exports = router;
