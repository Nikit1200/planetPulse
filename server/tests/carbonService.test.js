const {
  calculateCO2,
  getEmissionFactor,
  getUnit,
  isValidType,
  isAbsurdInput,
  getAbsurdThreshold
} = require('../services/carbonService');

describe('Carbon Service - CO2 Calculations & Emission Factors', () => {
  describe('Mandatory Hackathon Factor Verification', () => {
    test('Travel: 10 km should equal exactly 2.00 kg CO2 (10 * 0.20)', () => {
      expect(calculateCO2('travel', 10)).toBe(2);
    });

    test('Bus: 10 km should equal exactly 0.80 kg CO2 (10 * 0.08)', () => {
      expect(calculateCO2('bus', 10)).toBe(0.8);
    });

    test('Flight: 10 km should equal exactly 2.50 kg CO2 (10 * 0.25)', () => {
      expect(calculateCO2('flight', 10)).toBe(2.5);
    });

    test('Electricity: 5 kWh should equal exactly 4.00 kg CO2 (5 * 0.80)', () => {
      expect(calculateCO2('electricity', 5)).toBe(4);
    });

    test('Vegetarian meal: 2 meals should equal exactly 1.00 kg CO2 (2 * 0.50)', () => {
      expect(calculateCO2('veg_meal', 2)).toBe(1);
    });

    test('Non-vegetarian meal: 2 meals should equal exactly 4.00 kg CO2 (2 * 2.00)', () => {
      expect(calculateCO2('nonveg_meal', 2)).toBe(4);
    });
  });

  describe('Emission Factors & Unit Mappings', () => {
    test('Returns correct emission factor for each type', () => {
      expect(getEmissionFactor('travel')).toBe(0.20);
      expect(getEmissionFactor('bus')).toBe(0.08);
      expect(getEmissionFactor('flight')).toBe(0.25);
      expect(getEmissionFactor('electricity')).toBe(0.80);
      expect(getEmissionFactor('veg_meal')).toBe(0.5);
      expect(getEmissionFactor('nonveg_meal')).toBe(2.0);
    });

    test('Returns correct unit for each type', () => {
      expect(getUnit('travel')).toBe('km');
      expect(getUnit('bus')).toBe('km');
      expect(getUnit('flight')).toBe('km');
      expect(getUnit('electricity')).toBe('kWh');
      expect(getUnit('veg_meal')).toBe('meal');
      expect(getUnit('nonveg_meal')).toBe('meal');
    });

    test('isValidType identifies valid and invalid types', () => {
      expect(isValidType('travel')).toBe(true);
      expect(isValidType('bus')).toBe(true);
      expect(isValidType('flight')).toBe(true);
      expect(isValidType('electricity')).toBe(true);
      expect(isValidType('veg_meal')).toBe(true);
      expect(isValidType('nonveg_meal')).toBe(true);
      expect(isValidType('spaceship')).toBe(false);
      expect(isValidType('')).toBe(false);
      expect(isValidType(null)).toBe(false);
    });
  });

  describe('Validation & Edge Cases', () => {
    test('Throws error for unsupported or invalid activity type', () => {
      expect(() => calculateCO2('unsupported_type', 10)).toThrow('Invalid or unsupported activity type');
      expect(() => calculateCO2('', 10)).toThrow('Invalid or unsupported activity type');
      expect(() => calculateCO2(null, 10)).toThrow('Invalid or unsupported activity type');
    });

    test('Throws error for zero quantity', () => {
      expect(() => calculateCO2('travel', 0)).toThrow('Quantity must be a positive numeric value greater than zero');
    });

    test('Throws error for negative quantity', () => {
      expect(() => calculateCO2('travel', -5)).toThrow('Quantity must be a positive numeric value greater than zero');
    });

    test('Throws error for non-numeric quantity', () => {
      expect(() => calculateCO2('travel', 'abc')).toThrow('Quantity must be a positive numeric value greater than zero');
      expect(() => calculateCO2('travel', NaN)).toThrow('Quantity must be a positive numeric value greater than zero');
      expect(() => calculateCO2('travel', undefined)).toThrow('Quantity must be a positive numeric value greater than zero');
    });

    test('Throws error for Infinity quantity', () => {
      expect(() => calculateCO2('travel', Infinity)).toThrow('Quantity must be a positive numeric value greater than zero');
    });
  });

  describe('DP2 - Absurd Input Detection', () => {
    test('Returns correct thresholds for types', () => {
      expect(getAbsurdThreshold('travel')).toBe(1000);
      expect(getAbsurdThreshold('bus')).toBe(1000);
      expect(getAbsurdThreshold('flight')).toBe(10000);
      expect(getAbsurdThreshold('electricity')).toBe(10000);
      expect(getAbsurdThreshold('veg_meal')).toBe(1000);
      expect(getAbsurdThreshold('nonveg_meal')).toBe(1000);
    });

    test('Correctly identifies quantities exceeding absurd threshold', () => {
      expect(isAbsurdInput('flight', 500000)).toBe(true);
      expect(isAbsurdInput('flight', 10001)).toBe(true);
      expect(isAbsurdInput('flight', 10000)).toBe(false);
      expect(isAbsurdInput('flight', 500)).toBe(false);

      expect(isAbsurdInput('travel', 1500)).toBe(true);
      expect(isAbsurdInput('travel', 1000)).toBe(false);
      expect(isAbsurdInput('travel', 50)).toBe(false);

      expect(isAbsurdInput('electricity', 12000)).toBe(true);
      expect(isAbsurdInput('veg_meal', 1001)).toBe(true);
    });
  });
});
