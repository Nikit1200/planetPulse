import { describe, it, expect } from 'vitest';
import {
  ACTIVITY_TYPES,
  getEmissionFactor,
  getUnitForType,
  getActivityConfig,
  calculateFrontendEstimate
} from '../src/utils/carbonFactors';

describe('Frontend Carbon Factors & Live Preview Service', () => {
  describe('Exact Emission Factors (Sections 7 & 35)', () => {
    it('travel must equal 0.20 kg CO₂ / km', () => {
      expect(getEmissionFactor('travel')).toBe(0.20);
      expect(getUnitForType('travel')).toBe('km');
    });

    it('bus must equal 0.08 kg CO₂ / km', () => {
      expect(getEmissionFactor('bus')).toBe(0.08);
      expect(getUnitForType('bus')).toBe('km');
    });

    it('flight must equal 0.25 kg CO₂ / km', () => {
      expect(getEmissionFactor('flight')).toBe(0.25);
      expect(getUnitForType('flight')).toBe('km');
    });

    it('electricity must equal 0.80 kg CO₂ / kWh', () => {
      expect(getEmissionFactor('electricity')).toBe(0.80);
      expect(getUnitForType('electricity')).toBe('kWh');
    });

    it('veg_meal must equal 0.50 kg CO₂ / meal', () => {
      expect(getEmissionFactor('veg_meal')).toBe(0.50);
      expect(getUnitForType('veg_meal')).toBe('meal');
    });

    it('nonveg_meal must equal 2.00 kg CO₂ / meal', () => {
      expect(getEmissionFactor('nonveg_meal')).toBe(2.00);
      expect(getUnitForType('nonveg_meal')).toBe('meal');
    });

    it('returns exactly 6 supported activity types', () => {
      expect(ACTIVITY_TYPES).toHaveLength(6);
      const values = ACTIVITY_TYPES.map(a => a.value);
      expect(values).toEqual(['travel', 'bus', 'flight', 'electricity', 'veg_meal', 'nonveg_meal']);
    });
  });

  describe('Frontend Live Calculation Preview (Sections 8 & 35)', () => {
    it('calculates integer quantities accurately', () => {
      expect(calculateFrontendEstimate('travel', 10)).toBe(2);
      expect(calculateFrontendEstimate('bus', 10)).toBe(0.8);
      expect(calculateFrontendEstimate('flight', 100)).toBe(25);
      expect(calculateFrontendEstimate('electricity', 5)).toBe(4);
      expect(calculateFrontendEstimate('veg_meal', 2)).toBe(1);
      expect(calculateFrontendEstimate('nonveg_meal', 2)).toBe(4);
    });

    it('calculates decimal quantities accurately', () => {
      expect(calculateFrontendEstimate('travel', 10.5)).toBe(2.1);
      expect(calculateFrontendEstimate('electricity', 12.5)).toBe(10);
    });

    it('handles absurd large quantities accurately for live preview', () => {
      expect(calculateFrontendEstimate('flight', 500000)).toBe(125000);
    });

    it('returns null for empty, zero, negative, NaN, or invalid inputs', () => {
      expect(calculateFrontendEstimate('travel', '')).toBeNull();
      expect(calculateFrontendEstimate('travel', 0)).toBeNull();
      expect(calculateFrontendEstimate('travel', -10)).toBeNull();
      expect(calculateFrontendEstimate('travel', 'abc')).toBeNull();
      expect(calculateFrontendEstimate('travel', null)).toBeNull();
      expect(calculateFrontendEstimate('travel', undefined)).toBeNull();
      expect(calculateFrontendEstimate('unknown_type', 10)).toBeNull();
    });
  });

  describe('Config Retrieval', () => {
    it('returns undefined for unsupported type', () => {
      expect(getActivityConfig('rocket')).toBeUndefined();
      expect(getEmissionFactor('rocket')).toBe(0);
      expect(getUnitForType('rocket')).toBe('');
    });
  });
});
