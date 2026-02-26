const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    getMyGroups,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/my-groups', protect, getMyGroups);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroup);
router.post('/', protect, upload.single('avatar'), createGroup);
router.put('/:id/join', protect, joinGroup);
router.put('/:id/leave', protect, leaveGroup);
router.delete('/:id', protect, deleteGroup);

module.exports = router;
