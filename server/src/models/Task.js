import mongoose from 'mongoose';

const CATEGORIES = ['Personal', 'Work', 'Study', 'Shopping', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required.'],
    trim: true,
    minlength: [1, 'Title is required.'],
    maxlength: [120, 'Title must be 120 characters or fewer.'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [2000, 'Description must be 2,000 characters or fewer.'],
  },
  category: { type: String, enum: CATEGORIES, default: 'Other' },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
  durationMinutes: {
    type: Number,
    required: [true, 'Estimated duration is required.'],
    validate: {
      validator: (value) => Number.isSafeInteger(value) && value > 0,
      message: 'Estimated duration must be a positive whole number of minutes.',
    },
  },
  dueDate: {
    type: String,
    default: null,
    validate: {
      validator: (value) => value === null || isValidDateOnly(value),
      message: 'Due date must be a real date in YYYY-MM-DD format.',
    },
  },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
