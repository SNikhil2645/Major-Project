import mongoose from 'mongoose';
import dns from 'dns';
import { config } from 'dotenv';
import { User } from '../src/models/User';
import { UserRole } from '@placementor/shared';

dns.setServers(['8.8.8.8', '8.8.4.4']);

config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placementor';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@placementor.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists, skipping...');
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: 'Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: UserRole.Admin,
    isVerified: true,
  });

  console.log('Admin user created successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
