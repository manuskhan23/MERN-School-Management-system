import User from '../models/User.js';
import Class from '../models/Class.js';
import generateToken from '../utils/generateToken.js';

const loginPayload = (user) => ({
  token: generateToken(user._id, user.role),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    assignedClass: user.assignedClass,
    profileImage: user.profileImage,
    status: user.status,
    firstLogin: user.firstLogin,
    registrationFee: user.registrationFee ?? 0,
    salary: user.salary ?? 0,
  },
});

// @desc Register a new user (Admin only, legacy JSON body — prefer POST /api/users)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, assignedClass, registrationFee, salary } = req.body;
    if (role === 'admin' || !['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        message: 'Only teachers or students can be registered here. The school has one principal account.',
      });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const fee = role === 'student' ? Math.max(0, Number(registrationFee) || 0) : 0;
    const teacherSalary = role === 'teacher' ? Math.max(0, Number(salary) || 0) : 0;
    const user = await User.create({
      name,
      email,
      password,
      role,
      assignedClass: role === 'student' ? assignedClass : undefined,
      registrationFee: fee,
      salary: teacherSalary,
    });
    if (role === 'student' && assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, { $addToSet: { students: user._id } });
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedClass: user.assignedClass,
      status: user.status,
      registrationFee: user.registrationFee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact admin.' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json(loginPayload(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedClass').select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Forgot password - generate temp password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    user.firstLogin = true;
    await user.save();
    res.json({ message: 'Temporary password generated', tempPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update profile (name, profileImage only)
export const updateProfile = async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      status: updatedUser.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    user.firstLogin = false;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
