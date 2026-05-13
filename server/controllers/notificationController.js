import Notification from '../models/Notification.js';
import Class from '../models/Class.js';

// @desc Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { receiver: req.user._id };
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('sender', 'name role')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    res.json({ notifications, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.readStatus = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, readStatus: false },
      { readStatus: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create notification / announcement
export const createNotification = async (req, res) => {
  try {
    const { message, type, classId } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    // Send to whole school
    if (classId === 'whole-school') {
      const allClasses = await Class.find();
      const notifications = [];
      const studentIds = new Set();

      for (const cls of allClasses) {
        for (const studentId of cls.students) {
          studentIds.add(studentId.toString());
        }
      }

      for (const studentId of studentIds) {
        const notif = await Notification.create({
          sender: req.user._id,
          receiver: studentId,
          message,
          type: type || 'announcement',
        });
        notifications.push(notif);
      }

      // Also create a notification for the sender
      await Notification.create({
        sender: req.user._id,
        receiver: req.user._id,
        message: `You sent: ${message}`,
        type: type || 'announcement',
        readStatus: true,
      });

      return res.status(201).json({ message: `Sent to ${notifications.length} students`, notifications });
    }

    // Send to specific class
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const notifications = [];
    for (const studentId of cls.students) {
      const notif = await Notification.create({
        sender: req.user._id,
        receiver: studentId,
        message,
        type: type || 'announcement',
      });
      notifications.push(notif);
    }

    // Also create a notification for the sender
    await Notification.create({
      sender: req.user._id,
      receiver: req.user._id,
      message: `You sent: ${message}`,
      type: type || 'announcement',
      readStatus: true,
    });

    return res.status(201).json({ message: `Sent to ${notifications.length} students`, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      receiver: req.user._id,
      readStatus: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
