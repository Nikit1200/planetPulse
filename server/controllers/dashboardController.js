const Activity = require('../models/Activity');
const { getOrCreateSettings } = require('./targetController');
const { getCurrentWeekRange, getWeekDays } = require('../services/dateService');
const { EMISSION_FACTORS } = require('../services/carbonService');

/**
 * Supported categories list
 */
const SUPPORTED_CATEGORIES = [
  'travel',
  'bus',
  'flight',
  'electricity',
  'veg_meal',
  'nonveg_meal'
];

/**
 * @desc    Get dashboard metrics and aggregations for the current week (Monday -> Sunday)
 * @route   GET /api/dashboard
 */
const getDashboardData = async (req, res, next) => {
  try {
    const { startOfWeek, endOfWeek, start, end } = getCurrentWeekRange();

    // 1. Fetch current weekly target from Settings (singleton)
    const settings = await getOrCreateSettings();
    const weeklyTarget = settings.weeklyTarget;

    // 2. Fetch all activities for the current week (Monday 00:00 to Sunday 23:59 UTC)
    const weekActivities = await Activity.find({
      date: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ date: -1, createdAt: -1 }).lean();

    // 3. Compute total CO2 and count for the week
    const rawTotalCO2 = weekActivities.reduce((acc, curr) => acc + (curr.co2 || 0), 0);
    const totalCO2 = Math.round(rawTotalCO2 * 100) / 100;
    const activityCount = weekActivities.length;

    // 4. Target comparison calculations
    const rawPercentage = weeklyTarget > 0 ? (totalCO2 / weeklyTarget) * 100 : 0;
    const percentage = Math.round(rawPercentage * 100) / 100;

    // targetExceeded: strictly greater than
    const targetExceeded = totalCO2 > weeklyTarget;

    // remaining: under target headroom, 0 if exceeded
    const remaining = !targetExceeded
      ? Math.round((weeklyTarget - totalCO2) * 100) / 100
      : 0;

    // exceededBy: over target amount, 0 if not exceeded
    const exceededBy = targetExceeded
      ? Math.round((totalCO2 - weeklyTarget) * 100) / 100
      : 0;

    // 5. Category breakdown: all 6 categories present with numeric totals
    const categoryBreakdown = {};
    SUPPORTED_CATEGORIES.forEach((cat) => {
      categoryBreakdown[cat] = 0;
    });

    weekActivities.forEach((act) => {
      if (categoryBreakdown[act.type] !== undefined) {
        categoryBreakdown[act.type] += act.co2 || 0;
      }
    });

    // Round each category total to 2 decimal places
    SUPPORTED_CATEGORIES.forEach((cat) => {
      categoryBreakdown[cat] = Math.round(categoryBreakdown[cat] * 100) / 100;
    });

    // 6. Daily breakdown: exactly 7 days from Monday to Sunday in strict order
    const weekDays = getWeekDays();
    const dailyBreakdown = weekDays.map((dayInfo) => {
      // Filter activities whose date falls within this calendar day's UTC boundaries
      const dayActivities = weekActivities.filter((act) => {
        const actDate = new Date(act.date);
        return actDate >= dayInfo.start && actDate <= dayInfo.end;
      });

      const dayCO2 = dayActivities.reduce((sum, item) => sum + (item.co2 || 0), 0);

      return {
        date: dayInfo.date,
        day: dayInfo.day,
        co2: Math.round(dayCO2 * 100) / 100,
        activityCount: dayActivities.length
      };
    });

    // 7. Recent activities: 5 most recent activities overall
    const rawRecent = await Activity.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivities = rawRecent.map((act) => ({
      id: String(act._id),
      _id: String(act._id),
      type: act.type,
      quantity: act.quantity,
      unit: act.unit,
      co2: act.co2,
      date: act.date,
      createdAt: act.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        week: {
          start,
          end
        },
        totalCO2,
        weeklyTarget,
        percentage,
        remaining,
        exceededBy,
        targetExceeded,
        activityCount,
        categoryBreakdown,
        dailyBreakdown,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
