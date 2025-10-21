import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/mongodb';
import { env } from '../src/config/env';
import { User } from '../src/models/User';

async function seed() {
  await connectDatabase();

  const existing = await User.findOne({ email: env.ADMIN_SEED_EMAIL });
  if (existing) {
    console.log('Admin already seeded');
    return;
  }

  await User.create({
    name: 'Super Admin',
    email: env.ADMIN_SEED_EMAIL,
    password: env.ADMIN_SEED_PASS,
    role: 'admin'
  });

  console.log('Admin user created');
}

seed()
  .catch((error) => {
    console.error('Seed failed', error);
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
