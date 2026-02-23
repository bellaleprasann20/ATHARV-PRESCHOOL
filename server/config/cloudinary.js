/**
 * config/cloudinary.js
 *
 * Cloudinary upload configuration + multer storage adapters.
 * Falls back to local disk storage if USE_CLOUDINARY is not 'true'.
 *
 * Add to .env:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 *   USE_CLOUDINARY=true
 *
 * Usage (replaces uploadMiddleware.js in routes):
 *   const { uploadPhoto, uploadDocument, deletePhoto } = require('../config/cloudinary');
 *   router.put('/:id', uploadPhoto.single('photo'), updateStudent);
 */

const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const logger     = require('../utils/logger');

// ── SDK config ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const USE_CLOUDINARY =
  process.env.USE_CLOUDINARY === 'true' &&
  !!process.env.CLOUDINARY_CLOUD_NAME;

// ── File type filters ─────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed (jpg, png, webp)'), false);
};

const docFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only images and PDFs are allowed'), false);
};

// ── Local disk storage (fallback) ────────────────────────────
const localStorage = (subfolder) => {
  const dest = path.join(__dirname, '../uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename:    (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  });
};

// ── Cloudinary storage (multer-storage-cloudinary) ───────────
let CloudinaryStorage;
if (USE_CLOUDINARY) {
  try {
    ({ CloudinaryStorage } = require('multer-storage-cloudinary'));
  } catch {
    logger.warn('⚠️  multer-storage-cloudinary not installed. Run: npm i multer-storage-cloudinary cloudinary');
  }
}

const cloudinaryPhotoStorage = USE_CLOUDINARY && CloudinaryStorage
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder:          'atharv-preschool/photos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation:  [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        public_id: (_req, file) =>
          `student_${Date.now()}_${path.parse(file.originalname).name.replace(/\s+/g, '_')}`,
      },
    })
  : null;

const cloudinaryDocStorage = USE_CLOUDINARY && CloudinaryStorage
  ? new CloudinaryStorage({
      cloudinary,
      params: (req, file) => ({
        folder:        'atharv-preschool/documents',
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
        public_id:     `doc_${Date.now()}`,
      }),
    })
  : null;

// ── Multer instances (exported — drop-in for uploadMiddleware) ─
const uploadPhoto = multer({
  storage:    cloudinaryPhotoStorage || localStorage('photos'),
  fileFilter: imageFilter,
  limits:     { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

const uploadDocument = multer({
  storage:    cloudinaryDocStorage || localStorage('documents'),
  fileFilter: docFilter,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── deletePhoto — call on student update/delete ───────────────
/**
 * Deletes a stored photo whether it's on Cloudinary or local disk.
 * Safe to call with null / empty string.
 *
 * @param {string} photoUrl  The `photo` field value from Student document
 */
const deletePhoto = async (photoUrl) => {
  if (!photoUrl) return;

  if (photoUrl.includes('cloudinary.com')) {
    // Extract public_id: everything after /upload/vXXXXXX/ and before extension
    try {
      const match = photoUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
      if (match) {
        await cloudinary.uploader.destroy(match[1]);
        logger.info(`🗑️  Cloudinary photo deleted: ${match[1]}`);
      }
    } catch (err) {
      logger.warn(`⚠️  Cloudinary delete failed: ${err.message}`);
    }
    return;
  }

  // Local file (path stored as /uploads/photos/filename.jpg)
  const localPath = path.join(__dirname, '../', photoUrl.replace(/^\//, ''));
  if (fs.existsSync(localPath)) {
    fs.unlink(localPath, (err) => {
      if (err) logger.warn(`⚠️  Local photo delete failed: ${err.message}`);
      else     logger.info(`🗑️  Local photo deleted: ${localPath}`);
    });
  }
};

/**
 * Upload a raw Buffer to Cloudinary (no multer — useful for PDFs/receipts).
 *
 * @param {Buffer} buffer
 * @param {object} opts   cloudinary.uploader.upload_stream options
 * @returns {Promise<object>} cloudinary result ({ secure_url, public_id, ... })
 */
const uploadBuffer = (buffer, opts = {}) => {
  if (!USE_CLOUDINARY) throw new Error('Cloudinary not configured (USE_CLOUDINARY=true required)');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'atharv-preschool', ...opts },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadPhoto,
  uploadDocument,
  deletePhoto,
  uploadBuffer,
  USE_CLOUDINARY,
};