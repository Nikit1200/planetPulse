const mongoose = require('mongoose');
const { isValidType } = require('../services/carbonService');
const { parseValidDate } = require('../services/dateService');

/**
 * Validates activity creation input according to PlanetPulse rules.
 * Does NOT trust client-supplied unit or co2.
 *
 * @param {Object} data
 * @param {string} data.type
 * @param {number|string} data.quantity
 * @param {string|Date} data.date
 * @returns {{ isValid: boolean, error?: string, parsedData?: { type: string, quantity: number, date: Date } }}
 */
const validateActivityInput = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object' };
  }

  const { type, quantity, date } = data;

  // 1. Validate activity type
  if (!type || typeof type !== 'string' || type.trim() === '') {
    return { isValid: false, error: 'Activity type is required' };
  }

  const cleanType = type.trim().toLowerCase();
  if (!isValidType(cleanType)) {
    return {
      isValid: false,
      error: `Unsupported activity type: '${type}'. Allowed: travel, bus, flight, electricity, veg_meal, nonveg_meal`
    };
  }

  // 2. Validate quantity
  if (quantity === undefined || quantity === null || quantity === '') {
    return { isValid: false, error: 'Quantity is required' };
  }

  const numQuantity = Number(quantity);
  if (
    typeof quantity === 'boolean' ||
    isNaN(numQuantity) ||
    !Number.isFinite(numQuantity) ||
    numQuantity <= 0
  ) {
    return {
      isValid: false,
      error: 'Quantity must be a valid, finite number greater than zero'
    };
  }

  // 3. Validate date
  if (date === undefined || date === null || date === '') {
    return { isValid: false, error: 'Date is required' };
  }

  let activityDate;
  try {
    activityDate = parseValidDate(date);
  } catch {
    return {
      isValid: false,
      error: 'Invalid date provided. Please use a valid calendar date format (e.g., YYYY-MM-DD)'
    };
  }

  return {
    isValid: true,
    parsedData: {
      type: cleanType,
      quantity: numQuantity,
      date: activityDate
    }
  };
};

/**
 * Validates MongoDB ObjectId string.
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
};

/**
 * Validates optional date query filters (from and to).
 * @param {string} [from]
 * @param {string} [to]
 * @returns {{ isValid: boolean, error?: string, fromDate?: Date, toDate?: Date }}
 */
const validateDateFilters = (from, to) => {
  let fromDate = null;
  let toDate = null;

  if (from) {
    try {
      fromDate = parseValidDate(from);
      fromDate.setUTCHours(0, 0, 0, 0);
    } catch {
      return { isValid: false, error: 'Invalid "from" date filter format' };
    }
  }

  if (to) {
    try {
      toDate = parseValidDate(to);
      toDate.setUTCHours(23, 59, 59, 999);
    } catch {
      return { isValid: false, error: 'Invalid "to" date filter format' };
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    return { isValid: false, error: '"from" date must be earlier than or equal to "to" date' };
  }

  return { isValid: true, fromDate, toDate };
};

/**
 * Validates weekly target input.
 * @param {*} target
 * @returns {{ isValid: boolean, error?: string, target?: number }}
 */
const validateTargetInput = (target) => {
  if (target === undefined || target === null || target === '') {
    return { isValid: false, error: 'weeklyTarget is required' };
  }

  const num = Number(target);
  if (typeof target === 'boolean' || isNaN(num) || !Number.isFinite(num) || num <= 0) {
    return {
      isValid: false,
      error: 'weeklyTarget must be a valid, finite number greater than zero'
    };
  }

  return {
    isValid: true,
    target: Math.round(num * 100) / 100
  };
};

module.exports = {
  validateActivityInput,
  isValidObjectId,
  validateDateFilters,
  validateTargetInput
};
