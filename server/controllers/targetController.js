const Settings = require('../models/Settings');
const { validateTargetInput } = require('../utils/validators');

/**
 * Helper to safely retrieve or atomically initialize default settings document (singleton).
 * Prevents duplicate documents on multiple calls.
 *
 * @returns {Promise<Object>}
 */
const getOrCreateSettings = async () => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { $setOnInsert: { weeklyTarget: 20 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );
  return settings;
};

/**
 * @desc    Get the current weekly target
 * @route   GET /api/target
 */
const getTarget = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({
      success: true,
      data: {
        weeklyTarget: settings.weeklyTarget
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the weekly target
 * @route   PUT /api/target
 */
const updateTarget = async (req, res, next) => {
  try {
    const validation = validateTargetInput(req.body.weeklyTarget);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const cleanTarget = validation.target;

    // Atomically update the single settings record
    const settings = await Settings.findOneAndUpdate(
      {},
      { weeklyTarget: cleanTarget },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        weeklyTarget: settings.weeklyTarget
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTarget,
  updateTarget,
  getOrCreateSettings
};
