import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import { createError } from './errorHandler';
import { Request } from 'express';

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, _file, cb) => {
    const safeId = uuidv4();
    cb(null, `upload-${safeId}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(createError(
      `File type not allowed. Accepted types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      400,
      'INVALID_FILE_TYPE'
    ));
  }
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(createError(
      `File extension not allowed. Accepted extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
      400,
      'INVALID_FILE_EXTENSION'
    ));
  }
  
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
    fields: 20,
  },
  fileFilter,
});

export { MAX_FILE_SIZE_MB, ALLOWED_MIME_TYPES };
