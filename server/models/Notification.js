import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['assignment', 'grade', 'promotion', 'announcement', 'system', 'student_removed', 'attendance'],
    default: 'system',
  },
  readStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
