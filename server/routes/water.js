import express from 'express';
import { body, validationResult } from 'express-validator';
import WaterIntake from '../models/WaterIntake.js';

const router = express.Router();

// @route   GET /api/water
// @desc    Get user water intake logs
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
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

    const waterIntake = await WaterIntake.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: waterIntake
    });
  } catch (error) {
    console.error('Get water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching water intake logs'
    });
  }
});

// @route   POST /api/water
// @desc    Create or update water intake for a specific date
// @access  Private
router.post('/', [
  body('glasses')
    .isInt({ min: 0, max: 50 })
    .withMessage('Glasses must be between 0 and 50'),
  body('amount')
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Amount must be between 0 and 5000ml')
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

    const { glasses, amount, date } = req.body;
    const userId = req.user._id;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set time to start of day for consistent date comparison
    targetDate.setHours(0, 0, 0, 0);

    // Check if water intake already exists for this date
    let waterIntake = await WaterIntake.findOne({
      userId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (waterIntake) {
      // Update existing record
      waterIntake.glasses = glasses;
      waterIntake.amount = amount;
      await waterIntake.save();

      res.json({
        success: true,
        message: 'Water intake updated successfully',
        data: waterIntake
      });
    } else {
      // Create new record
      waterIntake = new WaterIntake({
        userId,
        glasses,
        amount,
        date: targetDate
      });

      await waterIntake.save();

      res.status(201).json({
        success: true,
        message: 'Water intake created successfully',
        data: waterIntake
      });
    }
  } catch (error) {
    console.error('Create/update water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating/updating water intake'
    });
  }
});

// @route   PUT /api/water/:id
// @desc    Update a water intake log
// @access  Private
router.put('/:id', [
  body('glasses')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Glasses must be between 0 and 50'),
  body('amount')
    .optional()
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Amount must be between 0 and 5000ml')
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

    // Find water intake and ensure it belongs to the user
    const waterIntake = await WaterIntake.findOne({ _id: id, userId });
    
    if (!waterIntake) {
      return res.status(404).json({
        success: false,
        message: 'Water intake log not found'
      });
    }

    // Update water intake
    const updatedWaterIntake = await WaterIntake.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Water intake updated successfully',
      data: updatedWaterIntake
    });
  } catch (error) {
    console.error('Update water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating water intake'
    });
  }
});

// @route   DELETE /api/water/:id
// @desc    Delete a water intake log
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find water intake and ensure it belongs to the user
    const waterIntake = await WaterIntake.findOne({ _id: id, userId });
    
    if (!waterIntake) {
      return res.status(404).json({
        success: false,
        message: 'Water intake log not found'
      });
    }

    await WaterIntake.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Water intake deleted successfully'
    });
  } catch (error) {
    console.error('Delete water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting water intake'
    });
  }
});

// @route   GET /api/water/today
// @desc    Get today's water intake
// @access  Private
router.get('/today', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waterIntake = await WaterIntake.findOne({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      data: waterIntake || { glasses: 0, amount: 0 }
    });
  } catch (error) {
    console.error('Get today water intake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s water intake'
    });
  }
});

// @route   GET /api/water/stats
// @desc    Get water intake statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get water intake statistics
    const stats = await WaterIntake.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalGlasses: { $sum: '$glasses' },
          totalAmount: { $sum: '$amount' },
          avgGlasses: { $avg: '$glasses' },
          avgAmount: { $avg: '$amount' },
          daysTracked: { $sum: 1 }
        }
      }
    ]);

    // Get daily water intake for the period
    const dailyIntake = await WaterIntake.find({
      userId,
      date: { $gte: startDate }
    })
    .sort({ date: 1 })
    .select('date glasses amount');

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalGlasses: 0,
          totalAmount: 0,
          avgGlasses: 0,
          avgAmount: 0,
          daysTracked: 0
        },
        dailyIntake
      }
    });
  } catch (error) {
    console.error('Get water stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching water intake statistics'
    });
  }
});

export default router; 