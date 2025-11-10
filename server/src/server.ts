import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import adminRoutes from './routes/adminRoutes';
import achievementRoutes from './routes/achievementRoutes';
import uploadRoutes from './routes/uploadRoutes';
import alumniRoutes from './routes/alumniRoutes';
import trainingRoutes from './routes/trainingRoutes';
import messagingRoutes from './routes/messagingRoutes';
import connectionRoutes from './routes/connectionRoutes';

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX,
    message: 'Too many requests, please try again later.'
  })
);

app.get('/api/ping', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/connections', connectionRoutes);

app.use(errorHandler);

export default app;
