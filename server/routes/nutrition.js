import express from 'express';
import { body, validationResult } from 'express-validator';
import Nutrition from '../models/Nutrition.js';

const router = express.Router();

// @route   GET /api/nutrition
// @desc    Get user nutrition logs with optional filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, mealType, search } = req.query;
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

    // Add meal type filtering
    if (mealType) {
      query.mealType = mealType;
    }

    // Add search filtering
    if (search) {
      query.foodItem = { $regex: search, $options: 'i' };
    }

    const nutrition = await Nutrition.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: nutrition
    });
  } catch (error) {
    console.error('Get nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nutrition logs'
    });
  }
});

// @route   POST /api/nutrition
// @desc    Create a new nutrition log
// @access  Private
router.post('/', [
  body('foodItem')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Food item must be between 1 and 100 characters'),
  body('calories')
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  body('protein')
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  body('carbs')
    .isFloat({ min: 0 })
    .withMessage('Carbohydrates must be a positive number'),
  body('fats')
    .isFloat({ min: 0 })
    .withMessage('Fats must be a positive number'),
  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Invalid meal type'),
  body('servingSize')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Serving size cannot exceed 50 characters')
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

    const { foodItem, calories, protein, carbs, fats, mealType, servingSize, date } = req.body;
    const userId = req.user._id;

    const nutrition = new Nutrition({
      userId,
      foodItem,
      calories,
      protein,
      carbs,
      fats,
      mealType,
      servingSize,
      date: date || new Date()
    });

    await nutrition.save();

    res.status(201).json({
      success: true,
      message: 'Nutrition log created successfully',
      data: nutrition
    });
  } catch (error) {
    console.error('Create nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating nutrition log'
    });
  }
});

// @route   PUT /api/nutrition/:id
// @desc    Update a nutrition log
// @access  Private
router.put('/:id', [
  body('foodItem')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Food item must be between 1 and 100 characters'),
  body('calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  body('protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  body('carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbohydrates must be a positive number'),
  body('fats')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be a positive number'),
  body('mealType')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Invalid meal type'),
  body('servingSize')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Serving size cannot exceed 50 characters')
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

    // Find nutrition log and ensure it belongs to the user
    const nutrition = await Nutrition.findOne({ _id: id, userId });
    
    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log not found'
      });
    }

    // Update nutrition log
    const updatedNutrition = await Nutrition.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Nutrition log updated successfully',
      data: updatedNutrition
    });
  } catch (error) {
    console.error('Update nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating nutrition log'
    });
  }
});

// @route   DELETE /api/nutrition/:id
// @desc    Delete a nutrition log
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find nutrition log and ensure it belongs to the user
    const nutrition = await Nutrition.findOne({ _id: id, userId });
    
    if (!nutrition) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log not found'
      });
    }

    await Nutrition.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Nutrition log deleted successfully'
    });
  } catch (error) {
    console.error('Delete nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting nutrition log'
    });
  }
});

// @route   GET /api/nutrition/stats
// @desc    Get nutrition statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get nutrition statistics
    const stats = await Nutrition.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' },
          avgCalories: { $avg: '$calories' },
          avgProtein: { $avg: '$protein' },
          avgCarbs: { $avg: '$carbs' },
          avgFats: { $avg: '$fats' }
        }
      }
    ]);

    // Get nutrition by meal type
    const nutritionByMeal = await Nutrition.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 },
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' }
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
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
          avgCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFats: 0
        },
        byMeal: nutritionByMeal
      }
    });
  } catch (error) {
    console.error('Get nutrition stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nutrition statistics'
    });
  }
});

export default router; 