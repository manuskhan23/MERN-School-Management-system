import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const PRINCIPAL_EMAIL = 'principle@admin.com';
const PRINCIPAL_PASSWORD = 'principle827';

const seedPrincipal = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const existing = await User.findOne({ email: PRINCIPAL_EMAIL });
    if (existing) {
      console.log(`Principal already exists (${PRINCIPAL_EMAIL})`);
    } else {
      await User.create({
        name: 'Principal',
        email: PRINCIPAL_EMAIL,
        password: PRINCIPAL_PASSWORD,
        role: 'admin',
        firstLogin: false,
        registrationFee: 0,
      });
      console.log(`Principal created — ${PRINCIPAL_EMAIL} / ${PRINCIPAL_PASSWORD}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedPrincipal();
