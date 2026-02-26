const express = require('express');
const router = express.Router();
const {
    createResource,
    getResources,
    getResource,
    downloadResource,
    rateResource,
    deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getResources);
router.get('/:id', protect, getResource);
router.post('/', protect, upload.single('file'), createResource);
router.put('/:id/download', protect, downloadResource);
router.put('/:id/rate', protect, rateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
