import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/json',
      'application/zip',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/css',
      'text/html',
      'text/javascript',
      'text/x-python',
      'text/x-java-source',
      'text/x-typescript',
      'text/x-csrc',
      'text/x-c++src'
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});
