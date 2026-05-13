import User from '../models/User.js';
import Class from '../models/Class.js';
import Notification from '../models/Notification.js';

const principalGuard = (user, res) => {
  if (user.role === 'admin') {
    res.status(403).json({ message: 'The principal account is managed separately (Profile). It cannot be changed here.' });
    return true;
  }
  return false;
};

// @desc Get all users with filters and pagination (principal directory: teachers and students only — never lists admin)
export const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const query = { role: { $ne: 'admin' } };
    if (role) {
      if (role === 'admin') {
        return res.json({ users: [], total: 0, page: Number(page), pages: 0 });
      }
      query.role = role;
    }
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('assignedClass', 'className section')
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedClass', 'className section')
      .select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create user (Admin) — teachers or students only (single principal; no second admin). Students: fee + class; teachers: salary.
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedClass, registrationFee, salary } = req.body;
    if (role === 'admin' || !['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        message: 'You can only add teachers or students. The school has one principal account and it cannot be created here.',
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
      assignedClass: role === 'student' ? assignedClass || undefined : undefined,
      registrationFee: fee,
      salary: teacherSalary,
    });
    if (role === 'student' && assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, { $addToSet: { students: user._id } });
    }
    const created = await User.findById(user._id).select('-password').populate('assignedClass', 'className section');
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a student (teacher only — principal adds students via POST /api/users)
export const createStudent = async (req, res) => {
  try {
    const { name, email, password, assignedClass, registrationFee } = req.body;
    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const fee = Math.max(0, Number(registrationFee) || 0);

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const classId = assignedClass || null;
    if (!classId) {
      return res.status(400).json({ message: 'Class is required' });
    }
    const cls = await Class.findById(classId);
    if (!cls || String(cls.assignedTeacher) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only add students to classes you teach' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'student',
      assignedClass: classId,
      registrationFee: fee,
    });

    await Class.findByIdAndUpdate(classId, { $addToSet: { students: user._id } });

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        sender: req.user._id,
        receiver: admin._id,
        message: `Teacher ${req.user.name} registered new student ${user.name} (${user.email})`,
        type: 'system',
      });
    }

    const created = await User.findById(user._id).select('-password').populate('assignedClass', 'className section');
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc List students in classes taught by the current teacher
export const getTeacherStudents = async (req, res) => {
  try {
    const classIds = await Class.find({ assignedTeacher: req.user._id }).distinct('_id');
    const students = await User.find({ role: 'student', assignedClass: { $in: classIds } })
      .populate('assignedClass', 'className section')
      .select('-password')
      .sort({ name: 1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, assignedClass, profileImage, status, registrationFee, salary } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (principalGuard(user, res)) return;
    if (role === 'admin') {
      return res.status(400).json({ message: 'Cannot assign the admin role. There is only one principal account.' });
    }
    if (role && !['teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) {
      user.role = role;
      if (role === 'teacher') {
        user.registrationFee = 0;
        user.assignedClass = undefined;
      }
      if (role === 'student') {
        user.salary = 0;
      }
    }
    if (assignedClass !== undefined) {
      user.assignedClass = user.role === 'student' ? assignedClass || null : null;
    }
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
      user.hasProfileImage = !!profileImage;
    }
    if (status) user.status = status;
    if (registrationFee !== undefined && user.role === 'student') {
      user.registrationFee = Math.max(0, Number(registrationFee) || 0);
    }
    if (salary !== undefined && user.role === 'teacher') {
      user.salary = Math.max(0, Number(salary) || 0);
    }
    const updatedUser = await user.save();
    const result = await User.findById(updatedUser._id).select('-password').populate('assignedClass', 'className section');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'The principal account cannot be deleted.' });
    }
    await Class.updateMany({ students: user._id }, { $pull: { students: user._id } });
    await Class.updateMany({ assignedTeacher: user._id }, { $unset: { assignedTeacher: '' } });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reset user password
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only the principal has authority to reset user passwords.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (principalGuard(user, res)) return;
    user.password = newPassword;
    user.firstLogin = false;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle user status
export const toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (principalGuard(user, res)) return;
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json({ message: `User ${user.status}`, status: user.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
