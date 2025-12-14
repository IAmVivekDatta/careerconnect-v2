import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    // Keep aligned with client-side guard in messages/helpers (5MB)
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      // documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/rtf',
      // archives
      'application/zip',
      'application/x-zip-compressed',
      'application/x-7z-compressed',
      // images
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      // text & code
      'text/plain',
      'text/css',
      'text/html',
      'text/javascript',
      'application/javascript',
      'application/json',
      'text/markdown',
      'text/x-python',
      'text/x-java-source',
      'text/x-typescript',
      'application/x-typescript',
      'text/x-csrc',
      'text/x-c++src',
      'text/x-go',
      'text/x-ruby',
      'text/x-php',
      'application/x-sh',
      'application/x-yaml',
      'text/yaml',
      'text/x-sql'
    ];

    const extensionSafeList = new Set([
      'txt',
      'md',
      'json',
      'yaml',
      'yml',
      'sql',
      'css',
      'html',
      'js',
      'jsx',
      'ts',
      'tsx',
      'py',
      'rb',
      'php',
      'go',
      'java',
      'c',
      'cc',
      'cpp',
      'cs',
      'sh',
      'ps1',
      'bat',
      'rs'
    ]);

    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    // Some browsers report code files as octet-stream; fall back to extension check.
    if (file.mimetype === 'application/octet-stream' && file.originalname) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      if (ext && extensionSafeList.has(ext)) {
        return cb(null, true);
      }
    }

    return cb(new Error('Invalid file type'));
  }
});
