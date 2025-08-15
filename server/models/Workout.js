import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Workout type is required'],
    enum: [
      'cardio',
      'strength_training',
      'yoga',
      'pilates',
      'running',
      'cycling',
      'swimming',
      'walking',
      'hiit',
      'other'
    ]
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  caloriesBurned: {
    type: Number,
    required: [true, 'Calories burned is required'],
    min: [0, 'Calories burned cannot be negative']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  }
}, {
  timestamps: true
});

// Index for efficient queries
workoutSchema.index({ userId: 1, date: -1 });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout; 