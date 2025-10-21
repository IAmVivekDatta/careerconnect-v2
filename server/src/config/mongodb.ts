import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI);
  console.log('MongoDB connected');
}
