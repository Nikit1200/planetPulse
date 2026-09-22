/**
 * Centralized Outlier Detection Configuration for Decision Point 2 (DP2).
 * These are UX warning thresholds to confirm user intent, NOT emission factor limits.
 * The backend remains authoritative for valid domains and calculations.
 */

export const UNUSUAL_THRESHOLDS = {
  travel: 10000,        // 10,000 km
  bus: 10000,           // 10,000 km
  flight: 50000,        // 50,000 km
  electricity: 10000,   // 10,000 kWh
  veg_meal: 1000,       // 1,000 meals
  nonveg_meal: 1000     // 1,000 meals
};

/**
 * Checks if a given activity type and quantity exceeds the soft warning threshold.
 *
 * @param {string} type - Activity type key
 * @param {number|string} quantity - Numeric quantity entered by user
 * @returns {boolean} True if the quantity exceeds the threshold, false otherwise
 */
export const isUnusualActivity = (type, quantity) => {
  if (quantity === undefined || quantity === null || quantity === '') {
    return false;
  }
  const num = Number(quantity);
  if (isNaN(num) || !Number.isFinite(num) || num <= 0) {
    return false;
  }

  const threshold = UNUSUAL_THRESHOLDS[type];
  if (!threshold) return false;

  return num > threshold;
};

/**
 * Returns the threshold value for a given activity type.
 * @param {string} type
 * @returns {number}
 */
export const getUnusualThreshold = (type) => {
  return UNUSUAL_THRESHOLDS[type] || 10000;
};
