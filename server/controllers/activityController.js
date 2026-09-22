const Activity = require('../models/Activity');
const carbonService = require('../services/carbonService');
const {
  validateActivityInput,
  isValidObjectId,
  validateDateFilters
} = require('../utils/validators');

/**
 * @desc    Create a new activity
 * @route   POST /api/activities
 */
const createActivity = async (req, res, next) => {
  try {
    // 1. Centralized validation
    const validation = validateActivityInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const { type, quantity, date } = validation.parsedData;

    // 2. Authoritative backend computation (ignoring any client-supplied unit or co2)
    const unit = carbonService.getUnit(type);
    const co2 = carbonService.calculateCO2(type, quantity);

    // 3. Persist in MongoDB
    const activity = await Activity.create({
      type,
      quantity,
      unit,
      co2,
      date
    });

    return res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all activities with optional filtering and newest-first sorting
 * @route   GET /api/activities
 */
const getActivities = async (req, res, next) => {
  try {
    const { type, from, to } = req.query;
    const filter = {};

    // Filter by type if provided
    if (type && type !== 'all') {
      const cleanType = String(type).trim().toLowerCase();
      if (!carbonService.isValidType(cleanType)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported activity type filter: '${type}'. Allowed: travel, bus, flight, electricity, veg_meal, nonveg_meal`
        });
      }
      filter.type = cleanType;
    }

    // Filter by date range (from / to) if provided
    if (from || to) {
      const dateValidation = validateDateFilters(from, to);
      if (!dateValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }

      filter.date = {};
      if (dateValidation.fromDate) {
        filter.date.$gte = dateValidation.fromDate;
      }
      if (dateValidation.toDate) {
        filter.date.$lte = dateValidation.toDate;
      }
    }

    // Sort newest first by date and createdAt
    const activities = await Activity.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single activity by ID
 * @route   GET /api/activities/:id
 */
const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findById(id).lean();
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an activity by ID
 * @route   DELETE /api/activities/:id
 */
const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  deleteActivity
};
