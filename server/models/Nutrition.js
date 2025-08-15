import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
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
  foodItem: {
    type: String,
    required: [true, 'Food item is required'],
    trim: true,
    maxlength: [100, 'Food item cannot exceed 100 characters']
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    required: [true, 'Protein content is required'],
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: [true, 'Carbohydrate content is required'],
    min: [0, 'Carbohydrates cannot be negative']
  },
  fats: {
    type: Number,
    required: [true, 'Fat content is required'],
    min: [0, 'Fat cannot be negative']
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: [true, 'Meal type is required']
  },
  servingSize: {
    type: String,
    maxlength: [50, 'Serving size cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
nutritionSchema.index({ userId: 1, date: -1 });
nutritionSchema.index({ userId: 1, foodItem: 'text' });

const Nutrition = mongoose.model('Nutrition', nutritionSchema);

export default Nutrition; 