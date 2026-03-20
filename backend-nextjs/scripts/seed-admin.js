const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edvo_backend';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: String,
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    avatar: String,
    bio: String,
    headline: String,
    skills: { type: [String], default: [] }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const email = 'admin@edvo.local';
  const password = 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    {
      name: 'EDVO Admin',
      email,
      passwordHash,
      role: 'admin',
      headline: 'Platform Administrator',
      skills: ['admin', 'operations', 'content']
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Admin user ready');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${user.id}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});