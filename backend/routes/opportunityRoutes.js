const express = require('express');
const router = express.Router();
const {
    createOpportunity,
    getOpportunities,
    getOpportunity,
    applyOpportunity,
    saveOpportunity,
    deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getOpportunities);
router.get('/:id', protect, getOpportunity);
router.post('/', protect, upload.single('image'), createOpportunity);
router.put('/:id/apply', protect, applyOpportunity);
router.put('/:id/save', protect, saveOpportunity);
router.delete('/:id', protect, deleteOpportunity);

module.exports = router;
