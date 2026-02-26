const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary for file uploads
 * Falls back gracefully if credentials are not set
 */
const configureCloudinary = () => {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        console.log('☁️  Cloudinary configured');
    } else {
        console.log('⚠️  Cloudinary not configured - using local file storage');
    }
};

module.exports = { cloudinary, configureCloudinary };
