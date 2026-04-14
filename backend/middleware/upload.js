const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, safe);
  },
});

/** SDD — verification & product uploads: PDF, JPG, PNG only */
const ALLOWED = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/pjpeg',
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED.has(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, JPG, and PNG files are allowed (SDD).'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter,
});

module.exports = { upload, uploadDir };
