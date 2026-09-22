/**
 * Activity configurations for frontend forms, live estimates, and UI rendering.
 * Factors strictly match the hackathon specifications and backend authoritative factors.
 */

export const ACTIVITY_TYPES = [
  {
    value: 'travel',
    label: 'Travel',
    unit: 'km',
    factor: 0.20,
    threshold: 1000,
    icon: 'Car',
    description: '0.20 kg CO₂ / km'
  },
  {
    value: 'bus',
    label: 'Bus',
    unit: 'km',
    factor: 0.08,
    threshold: 1000,
    icon: 'Bus',
    description: '0.08 kg CO₂ / km'
  },
  {
    value: 'flight',
    label: 'Flight',
    unit: 'km',
    factor: 0.25,
    threshold: 10000,
    icon: 'Plane',
    description: '0.25 kg CO₂ / km'
  },
  {
    value: 'electricity',
    label: 'Electricity',
    unit: 'kWh',
    factor: 0.80,
    threshold: 10000,
    icon: 'Zap',
    description: '0.80 kg CO₂ / kWh'
  },
  {
    value: 'veg_meal',
    label: 'Veg Meal',
    unit: 'meal',
    factor: 0.50,
    threshold: 1000,
    icon: 'Salad',
    description: '0.50 kg CO₂ / meal'
  },
  {
    value: 'nonveg_meal',
    label: 'Non-Veg Meal',
    unit: 'meal',
    factor: 2.00,
    threshold: 1000,
    icon: 'Beef',
    description: '2.00 kg CO₂ / meal'
  }
];

/**
 * Returns configuration object for given activity type
 * @param {string} type
 * @returns {Object|undefined}
 */
export const getActivityConfig = (type) => {
  return ACTIVITY_TYPES.find((item) => item.value === type);
};

/**
 * Get the emission factor for an activity type
 * @param {string} type
 * @returns {number}
 */
export const getEmissionFactor = (type) => {
  const config = getActivityConfig(type);
  return config ? config.factor : 0;
};

/**
 * Derives the unit for an activity type
 * @param {string} type
 * @returns {string}
 */
export const getUnitForType = (type) => {
  const config = getActivityConfig(type);
  return config ? config.unit : '';
};

/**
 * Computes the client-side live estimated CO2
 * @param {string} type
 * @param {number|string} quantity
 * @returns {number|null} Returns number if valid, or null if quantity is empty/invalid/unknown
 */
export const calculateFrontendEstimate = (type, quantity) => {
  if (quantity === undefined || quantity === null || quantity === '') {
    return null;
  }
  const num = Number(quantity);
  if (isNaN(num) || !Number.isFinite(num) || num <= 0) {
    return null;
  }
  const config = getActivityConfig(type);
  if (!config) {
    return null;
  }
  return Math.round(num * config.factor * 100) / 100;
};
