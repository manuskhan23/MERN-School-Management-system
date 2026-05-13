import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AVATAR_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F0', '#F0FF33', '#33F0FF',
  '#FF8C33', '#33FF8C', '#8C33FF', '#FF338C', '#8CFF33', '#338CFF',
  '#FFC300', '#C3FF00', '#00FFC3', '#FF00C3', '#C300FF', '#00C3FF',
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true,
  },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  profileImage: {
    type: String,
    default: '',
  },
  avatarColor: {
    type: String,
    default: () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  },
  hasProfileImage: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  firstLogin: {
    type: Boolean,
    default: false,
  },
  registrationFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  salary: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
