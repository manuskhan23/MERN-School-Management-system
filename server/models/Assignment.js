import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  attachments: [String],
  submissions: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      file: String,
      text: String,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      grade: Number,
      feedback: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
