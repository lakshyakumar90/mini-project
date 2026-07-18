const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const hasCloudinaryKeys = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

// Ensure local upload directories exist
const avatarsDir = path.join(__dirname, '../uploads/avatars');
const postsDir = path.join(__dirname, '../uploads/posts');
const coversDir = path.join(__dirname, '../uploads/covers');
const documentsDir = path.join(__dirname, '../uploads/documents');

if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
if (!fs.existsSync(documentsDir)) fs.mkdirSync(documentsDir, { recursive: true });

// Cloudinary Storages
const cloudAvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devconnect/avatars',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const cloudPostStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devconnect/posts',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

const cloudCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devconnect/covers',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1600, height: 600, crop: 'limit' }]
  }
});

// We keep documents local or you can configure raw uploads to cloudinary if needed, but typically docs might be better suited for different handling. Cloudinary supports docs via resource_type: 'raw'
const cloudDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devconnect/documents',
    resource_type: 'raw', // For pdf, docx etc.
    allowedFormats: ['pdf', 'doc', 'docx']
  }
});

// Local Storages (Fallback)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const postImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coversDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, documentsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed!'));
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  }
};

const rawUploadAvatar = multer({
  storage: hasCloudinaryKeys ? cloudAvatarStorage : avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

const rawUploadPostImage = multer({
  storage: hasCloudinaryKeys ? cloudPostStorage : postImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

const rawUploadCover = multer({
  storage: hasCloudinaryKeys ? cloudCoverStorage : coverStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

const rawUploadDocument = multer({
  storage: hasCloudinaryKeys ? cloudDocumentStorage : documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: documentFileFilter
});

// Middleware wrapper to catch any Multer/Stream errors cleanly without 500 crashes
const createUploadMiddleware = (multerInstance, fieldName) => (req, res, next) => {
  multerInstance.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error(`[Upload Middleware Error on ${fieldName}]:`, err.message || err);
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 10MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload failed. Please verify file format and size.' });
    }
    next();
  });
};

// Middleware wrapper for multiple files
const createUploadMultipleMiddleware = (multerInstance, fieldName, maxCount = 5) => (req, res, next) => {
  multerInstance.array(fieldName, maxCount)(req, res, (err) => {
    if (err) {
      console.error(`[Upload Multiple Middleware Error on ${fieldName}]:`, err.message || err);
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 10MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload failed. Please verify file format and size.' });
    }
    next();
  });
};

// Middleware wrapper for multiple fields with different max counts
const createUploadFieldsMiddleware = (multerInstance, fields) => (req, res, next) => {
  multerInstance.fields(fields)(req, res, (err) => {
    if (err) {
      console.error(`[Upload Fields Middleware Error]:`, err.message || err);
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 10MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload failed. Please verify file format and size.' });
    }
    next();
  });
};

const uploadAvatar = { single: (field) => createUploadMiddleware(rawUploadAvatar, field) };
const uploadPostImage = { single: (field) => createUploadMiddleware(rawUploadPostImage, field) };
const uploadCover = { single: (field) => createUploadMiddleware(rawUploadCover, field) };
const uploadDocument = { 
  single: (field) => createUploadMiddleware(rawUploadDocument, field),
  array: (field, maxCount) => createUploadMultipleMiddleware(rawUploadDocument, field, maxCount),
  fields: (fields) => createUploadFieldsMiddleware(rawUploadDocument, fields)
};

// Helper to get public URL from req.file regardless of storage provider
const getFileUrl = (file, type = 'avatars') => {
  if (!file) return null;
  // If it's uploaded to Cloudinary via multer-storage-cloudinary, the URL is in file.path
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }
  // Fallback for local disk storage
  if (file.filename) {
    const port = process.env.PORT || 3333;
    const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
    return `${baseUrl}/uploads/${type}/${file.filename}`;
  }
  return null;
};

// This function is kept for backward compatibility and cases where we need to manually upload,
// but with CloudinaryStorage, req.file.path is already the Cloudinary URL.
const resolveImageUrl = async (file, folderName = 'posts', type = 'posts', transformOptions = null) => {
  if (!file) return null;
  let fileUrl = getFileUrl(file, type);
  // If it's already a Cloudinary URL from CloudinaryStorage, we just return it.
  if (fileUrl && fileUrl.startsWith('http') && !fileUrl.includes('localhost')) {
     return fileUrl;
  }
  // Otherwise, attempt manual upload (fallback logic)
  if (hasCloudinaryKeys && file.path && !file.path.startsWith('http')) {
    try {
      const options = { folder: `devconnect/${folderName}` };
      if (transformOptions) {
        options.transformation = transformOptions;
      }
      const cloudRes = await cloudinary.uploader.upload(file.path, options);
      if (cloudRes && cloudRes.secure_url) {
        fileUrl = cloudRes.secure_url;
        fs.unlink(file.path, () => {});
      }
    } catch (cloudErr) {
      console.warn(`⚠️ Cloudinary upload to ${folderName} failed (${cloudErr.message}), falling back to local file: ${fileUrl}`);
    }
  }
  return fileUrl;
};

module.exports = {
  uploadAvatar,
  uploadPostImage,
  uploadCover,
  uploadDocument,
  getFileUrl,
  resolveImageUrl,
  hasCloudinaryKeys
};
