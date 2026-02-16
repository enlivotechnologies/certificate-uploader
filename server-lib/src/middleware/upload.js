/**
 * Multer config for CSV file uploads (bulk generate).
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from '../config/env.js';

// Ensure temp directory exists for uploads
const uploadDir = path.join(env.paths.temp, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.csv';
    cb(null, `bulk-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const name = file?.originalname ?? '';
  const ext = path.extname(name).toLowerCase();
  if (ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed for bulk upload'), false);
  }
};

export const uploadBulk = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('file');
