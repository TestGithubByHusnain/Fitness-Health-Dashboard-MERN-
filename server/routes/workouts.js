import express from 'express';
import { body, validationResult } from 'express-validator';
import Workout from '../models/Workout.js';

const router = express.Router();

// @route   GET /api/workouts
// @desc    Get user workouts with optional date filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const userId = req.user._id;

    // Build query
    let query = { userId };

    // Add date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Add type filtering
    if (type) {
      query.type = type;
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workouts'
    });
  }
});

// @route   POST /api/workouts
// @desc    Create a new workout
// @access  Private
router.post('/', [
  body('type')
    .isIn(['cardio', 'strength_training', 'yoga', 'pilates', 'running', 'cycling', 'swimming', 'walking', 'hiit', 'other'])
    .withMessage('Invalid workout type'),
  body('duration')
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes'),
  body('caloriesBurned')
    .isFloat({ min: 0 })
    .withMessage('Calories burned must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('intensity')
    .optional()
    .isIn(['low', 'moderate', 'high'])
    .withMessage('Invalid intensity level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { type, duration, caloriesBurned, description, intensity, date } = req.body;
    const userId = req.user._id;

    const workout = new Workout({
      userId,
      type,
      duration,
      caloriesBurned,
      description,
      intensity,
      date: date || new Date()
    });

    await workout.save();

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating workout'
    });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update a workout
// @access  Private
router.put('/:id', [
  body('type')
    .optional()
    .isIn(['cardio', 'strength_training', 'yoga', 'pilates', 'running', 'cycling', 'swimming', 'walking', 'hiit', 'other'])
    .withMessage('Invalid workout type'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes'),
  body('caloriesBurned')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calories burned must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('intensity')
    .optional()
    .isIn(['low', 'moderate', 'high'])
    .withMessage('Invalid intensity level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user._id;

    // Find workout and ensure it belongs to the user
    const workout = await Workout.findOne({ _id: id, userId });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: updatedWorkout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating workout'
    });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete a workout
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find workout and ensure it belongs to the user
    const workout = await Workout.findOne({ _id: id, userId });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await Workout.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting workout'
    });
  }
});

// @route   GET /api/workouts/stats
// @desc    Get workout statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get workout statistics
    const stats = await Workout.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$caloriesBurned' }
        }
      }
    ]);

    // Get workouts by type
    const workoutsByType = await Workout.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCalories: { $sum: '$caloriesBurned' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalWorkouts: 0,
          totalDuration: 0,
          totalCalories: 0,
          avgDuration: 0,
          avgCalories: 0
        },
        byType: workoutsByType
      }
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching workout statistics'
    });
  }
});

export default router; 