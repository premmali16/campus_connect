const multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * Multer configuration for file uploads
 * Uses memory storage in production (for Cloudinary upload)
 * Uses disk storage in development (for local file serving)
 */
const storage = process.env.NODE_ENV === 'production'
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    });

// File filter - allow images, PDFs, and document files
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

/**
 * Upload file to Cloudinary (used in production)
 * Falls back to local path in development
 */
const uploadToCloudinary = async (file, folder = 'campus-connect') => {
    if (process.env.NODE_ENV !== 'production' || !process.env.CLOUDINARY_CLOUD_NAME) {
        // Development: return local path
        return `/uploads/${file.filename}`;
    }

    // Production: upload buffer to Cloudinary
    return new Promise((resolve, reject) => {
        const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });
};

module.exports = upload;
module.exports.uploadToCloudinary = uploadToCloudinary;
