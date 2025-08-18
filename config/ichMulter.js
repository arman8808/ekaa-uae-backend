const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure ICH-specific upload directory exists
const uploadDir = 'uploads/ich-registrations';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    
    // Custom prefix based on file type
    let prefix;
    switch (file.fieldname) {
      case 'profileImage':
        prefix = 'ich-profile';
        break;
      case 'idPhotofront':
        prefix = 'ich-front-id';
        break;
      case 'idphotoback':
        prefix = 'ich-back-id';
        break;
      default:
        prefix = 'ich-file';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed for ICH registration!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// Export specific upload handler for ICH registration
exports.ichRegistrationUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'frontImage', maxCount: 1 },  // Changed from idPhotofront
  { name: 'backImage', maxCount: 1 }    // Changed from idphotoback
]);