const fs     = require('fs');
const path   = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', '..', 'frontend', 'images', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

function imagePathOf(file) {
  return `images/uploads/${file.filename}`;
}

function deleteImageFiles(imagePaths) {
  for (const imagePath of imagePaths) {
    if (!imagePath || !imagePath.startsWith('images/uploads/')) continue;
    fs.unlink(path.join(__dirname, '..', '..', 'frontend', imagePath), () => {});
  }
}

module.exports = { upload, imagePathOf, deleteImageFiles, uploadsDir };
