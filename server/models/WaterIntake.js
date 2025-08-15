import mongoose from 'mongoose';

const waterIntakeSchema = new mongoose.Schema({
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
  glasses: {
    type: Number,
    required: [true, 'Number of glasses is required'],
    min: [0, 'Glasses cannot be negative'],
    max: [50, 'Glasses cannot exceed 50']
  },
  amount: {
    type: Number, // in ml
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    max: [5000, 'Amount cannot exceed 5000ml']
  }
}, {
  timestamps: true
});

// Index for efficient queries
waterIntakeSchema.index({ userId: 1, date: -1 });

// Compound index to ensure one entry per user per day
waterIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });

const WaterIntake = mongoose.model('WaterIntake', waterIntakeSchema);

export default WaterIntake; 