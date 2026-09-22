/**
 * Centralized Carbon Emission Factors and Calculation Service
 * Authoritative source for all CO2 calculations in PlanetPulse.
 */

const EMISSION_FACTORS = {
  travel: {
    factor: 0.20,
    unit: 'km',
    label: 'Travel (Car / Personal Vehicle)',
    threshold: 1000
  },
  bus: {
    factor: 0.08,
    unit: 'km',
    label: 'Bus',
    threshold: 1000
  },
  flight: {
    factor: 0.25,
    unit: 'km',
    label: 'Flight',
    threshold: 10000
  },
  electricity: {
    factor: 0.80,
    unit: 'kWh',
    label: 'Electricity',
    threshold: 10000
  },
  veg_meal: {
    factor: 0.5,
    unit: 'meal',
    label: 'Vegetarian Meal',
    threshold: 1000
  },
  nonveg_meal: {
    factor: 2.0,
    unit: 'meal',
    label: 'Non-vegetarian Meal',
    threshold: 1000
  }
};

/**
 * Get the emission factor for an activity type
 * @param {string} type
 * @returns {number}
 */
const getEmissionFactor = (type) => {
  const config = EMISSION_FACTORS[type];
  if (!config) {
    throw new Error(`Unsupported activity type: ${type}`);
  }
  return config.factor;
};

/**
 * Get the unit of measurement for an activity type
 * @param {string} type
 * @returns {string}
 */
const getUnit = (type) => {
  const config = EMISSION_FACTORS[type];
  if (!config) {
    throw new Error(`Unsupported activity type: ${type}`);
  }
  return config.unit;
};

/**
 * Check if activity type is valid
 * @param {string} type
 * @returns {boolean}
 */
const isValidType = (type) => {
  return Boolean(type && Object.prototype.hasOwnProperty.call(EMISSION_FACTORS, type));
};

/**
 * Calculate CO2 emissions in kg
 * @param {string} type
 * @param {number} quantity
 * @returns {number} Rounded to 2 decimal places
 */
const calculateCO2 = (type, quantity) => {
  if (!isValidType(type)) {
    throw new Error(`Invalid or unsupported activity type: '${type}'`);
  }

  const numericQuantity = Number(quantity);

  if (
    quantity === null ||
    quantity === undefined ||
    isNaN(numericQuantity) ||
    !isFinite(numericQuantity) ||
    numericQuantity <= 0
  ) {
    throw new Error('Quantity must be a positive numeric value greater than zero');
  }

  const factor = getEmissionFactor(type);
  const rawCO2 = numericQuantity * factor;
  // Round to 2 decimal places to avoid IEEE floating point inaccuracies (e.g. 0.8000000000000002)
  return Math.round(rawCO2 * 100) / 100;
};

/**
 * Get threshold for absurd input detection (DP2)
 * @param {string} type
 * @returns {number|null}
 */
const getAbsurdThreshold = (type) => {
  return EMISSION_FACTORS[type]?.threshold || null;
};

/**
 * Check if an entered quantity exceeds the absurd input threshold
 * @param {string} type
 * @param {number} quantity
 * @returns {boolean}
 */
const isAbsurdInput = (type, quantity) => {
  const threshold = getAbsurdThreshold(type);
  if (!threshold) return false;
  return Number(quantity) > threshold;
};

module.exports = {
  EMISSION_FACTORS,
  calculateCO2,
  getEmissionFactor,
  getUnit,
  isValidType,
  getAbsurdThreshold,
  isAbsurdInput
};
