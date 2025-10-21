import dotenv from 'dotenv';

dotenv.config();

const rawMongo = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? process.env.MONGODB_URI ?? '';
const rawFrontend = process.env.CLIENT_URL ?? process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? '';

export const MONGO_URI = rawMongo;
export const CLIENT_URL = rawFrontend || 'http://localhost:5173';
export const JWT_SECRET = process.env.JWT_SECRET ?? 'change_me';

const resolvedEnv = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URI: rawMongo,
  JWT_SECRET: process.env.JWT_SECRET ?? 'change_me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? process.env.GOOGLE_CALLBACK_URL,
  FRONTEND_URL: rawFrontend || 'http://localhost:5173',
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL ?? 'admin@careerconnect.local',
  ADMIN_SEED_PASS: process.env.ADMIN_SEED_PASS ?? 'StrongPass123!',
  RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW ?? 15 * 60 * 1000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 100),
  CORS_ORIGINS: (
    (process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  )
};

// Warn only when truly missing critical values
if (!resolvedEnv.MONGO_URI) {
  console.warn('[env] Missing MongoDB connection string (MONGO_URI or MONGODB_URI)');
}
if (!resolvedEnv.JWT_SECRET || resolvedEnv.JWT_SECRET === 'change_me') {
  console.warn('[env] Using default JWT_SECRET; set JWT_SECRET in production');
}

export const env = resolvedEnv;
