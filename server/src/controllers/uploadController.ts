import { Request, Response } from 'express';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export const uploadFile = async (req: Request, res: Response) => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return res.status(400).json({ error: true, message: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.' });
  }

  // multer stores file in memory (buffer)
  // expect single file under field 'file'
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: true, message: 'No file uploaded' });

  try {
  const uploadStream = cloudinary.uploader.upload_stream({ folder: 'careerconnect', resource_type: 'auto' }, (err, result) => {
      if (err || !result) {
        return res.status(500).json({ error: true, message: 'Upload failed', details: err?.message });
      }
      res.json({ url: result.secure_url });
    });

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Upload error', details: err.message });
  }
};
