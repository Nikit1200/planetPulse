import { describe, it, expect } from 'vitest';
import {
  UNUSUAL_THRESHOLDS,
  isUnusualActivity,
  getUnusualThreshold
} from '../src/utils/unusualActivity';

describe('DP2 — Absurd Input / Outlier Detection (Sections 13, 14, 51, 52)', () => {
  it('centralizes all 6 activity thresholds', () => {
    expect(UNUSUAL_THRESHOLDS).toEqual({
      travel: 10000,
      bus: 10000,
      flight: 50000,
      electricity: 10000,
      veg_meal: 1000,
      nonveg_meal: 1000
    });
  });

  describe('Normal values do not trigger warning (Sections 15 & 51)', () => {
    it('travel 10 km does not trigger warning', () => {
      expect(isUnusualActivity('travel', 10)).toBe(false);
    });

    it('flight 1,200 km does not trigger warning', () => {
      expect(isUnusualActivity('flight', 1200)).toBe(false);
    });

    it('flight exactly 50,000 km does not trigger warning', () => {
      expect(isUnusualActivity('flight', 50000)).toBe(false);
    });

    it('bus 50 km does not trigger warning', () => {
      expect(isUnusualActivity('bus', 50)).toBe(false);
    });

    it('meal 2 meals does not trigger warning', () => {
      expect(isUnusualActivity('veg_meal', 2)).toBe(false);
      expect(isUnusualActivity('nonveg_meal', 2)).toBe(false);
    });
  });

  describe('Unusually large values trigger warning (Sections 14, 51, 53)', () => {
    it('flight 500,000 km triggers warning', () => {
      expect(isUnusualActivity('flight', 500000)).toBe(true);
    });

    it('flight 50,001 km triggers warning', () => {
      expect(isUnusualActivity('flight', 50001)).toBe(true);
    });

    it('travel 10,001 km triggers warning', () => {
      expect(isUnusualActivity('travel', 10001)).toBe(true);
    });

    it('electricity 10,500 kWh triggers warning', () => {
      expect(isUnusualActivity('electricity', 10500)).toBe(true);
    });

    it('meals 1,001 meals triggers warning', () => {
      expect(isUnusualActivity('veg_meal', 1001)).toBe(true);
      expect(isUnusualActivity('nonveg_meal', 1001)).toBe(true);
    });
  });

  describe('Invalid inputs do NOT trigger unusual dialog (Section 22: Invalid vs Unusual)', () => {
    it('0, negative numbers, empty string, NaN return false (handled by standard validation)', () => {
      expect(isUnusualActivity('flight', 0)).toBe(false);
      expect(isUnusualActivity('flight', -500)).toBe(false);
      expect(isUnusualActivity('flight', '')).toBe(false);
      expect(isUnusualActivity('flight', null)).toBe(false);
      expect(isUnusualActivity('flight', undefined)).toBe(false);
      expect(isUnusualActivity('flight', 'abc')).toBe(false);
      expect(isUnusualActivity('flight', Infinity)).toBe(false);
    });
  });

  describe('getUnusualThreshold helper', () => {
    it('returns threshold for type or default 10,000', () => {
      expect(getUnusualThreshold('flight')).toBe(50000);
      expect(getUnusualThreshold('unknown')).toBe(10000);
    });
  });
});
