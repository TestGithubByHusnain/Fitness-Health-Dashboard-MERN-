import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300 kg'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
  body('fitnessGoals.dailySteps')
    .optional()
    .isInt({ min: 1000, max: 50000 })
    .withMessage('Daily steps goal must be between 1000 and 50000'),
  body('fitnessGoals.dailyCalories')
    .optional()
    .isInt({ min: 1000, max: 5000 })
    .withMessage('Daily calories goal must be between 1000 and 5000'),
  body('fitnessGoals.dailyWater')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Daily water goal must be between 1 and 20 glasses'),
  body('fitnessGoals.weeklyWorkouts')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Weekly workouts goal must be between 1 and 7')
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

    const userId = req.user._id;
    const updateData = { ...req.body };

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/profile/stats
// @desc    Get user profile statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate BMI
    const bmi = user.calculateBMI();
    const bmiCategory = user.getBMICategory();

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr = 0;
    if (user.height && user.weight && user.age && user.gender) {
      if (user.gender === 'male') {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
      } else if (user.gender === 'female') {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
      } else {
        // Use average of male and female calculation
        const maleBMR = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
        const femaleBMR = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
        bmr = (maleBMR + femaleBMR) / 2;
      }
    }

    // Calculate TDEE (Total Daily Energy Expenditure) based on activity level
    let tdee = bmr;
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    if (user.activityLevel && activityMultipliers[user.activityLevel]) {
      tdee = bmr * activityMultipliers[user.activityLevel];
    }

    res.json({
      success: true,
      data: {
        bmi: bmi ? Math.round(bmi * 10) / 10 : null,
        bmiCategory,
        bmr: bmr ? Math.round(bmr) : null,
        tdee: tdee ? Math.round(tdee) : null,
        fitnessGoals: user.fitnessGoals
      }
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile statistics'
    });
  }
});

// @route   PUT /api/profile/password
// @desc    Update user password
// @access  Private
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }
});

export default router; 