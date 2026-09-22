import { describe, it, expect } from 'vitest';
import {
  formatCO2,
  formatDate,
  formatQuantity,
  formatDateSafe,
  formatWeekRange
} from '../src/utils/formatters';

describe('Frontend Formatting Utilities (Sections 43, 44, 45, 57)', () => {
  describe('formatCO2', () => {
    it('formats numbers to 2 decimal places with thousands separators', () => {
      expect(formatCO2(2)).toBe('2.00');
      expect(formatCO2(6.8)).toBe('6.80');
      expect(formatCO2(125000)).toBe('125,000.00');
      expect(formatCO2(0)).toBe('0.00');
    });

    it('returns "0.00" for NaN or invalid numbers', () => {
      expect(formatCO2('invalid')).toBe('0.00');
      expect(formatCO2(null)).toBe('0.00');
    });
  });

  describe('formatQuantity', () => {
    it('formats quantity with unit', () => {
      expect(formatQuantity(10, 'km')).toBe('10 km');
      expect(formatQuantity(500000, 'km')).toBe('500,000 km');
      expect(formatQuantity(2.5, 'meal')).toBe('2.5 meal');
    });
  });

  describe('formatDate', () => {
    it('formats valid date string', () => {
      expect(formatDate('2026-09-22')).toContain('2026');
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatDateSafe (Date-Only Timezone Shift Prevention - Section 57)', () => {
    it('safely formats YYYY-MM-DD date without shifting the calendar day', () => {
      const result = formatDateSafe('2026-09-22', { month: 'short', day: 'numeric', year: 'numeric' });
      expect(result).toBe('Sep 22, 2026');
    });

    it('formats date with weekday and month', () => {
      const result = formatDateSafe('2026-09-21', { weekday: 'short', month: 'short', day: 'numeric' });
      expect(result).toBe('Mon, Sep 21');
    });

    it('handles ISO strings containing T cleanly', () => {
      const result = formatDateSafe('2026-09-22T14:30:00.000Z', { month: 'short', day: 'numeric', year: 'numeric' });
      expect(result).toBe('Sep 22, 2026');
    });

    it('returns empty string for empty input', () => {
      expect(formatDateSafe('')).toBe('');
      expect(formatDateSafe(null)).toBe('');
    });
  });

  describe('formatWeekRange (DP3)', () => {
    it('formats week start and end cleanly', () => {
      const range = formatWeekRange('2026-09-21', '2026-09-27');
      expect(range).toBe('Mon, Sep 21 — Sun, Sep 27, 2026');
    });

    it('returns empty string if missing dates', () => {
      expect(formatWeekRange(null, null)).toBe('');
      expect(formatWeekRange('2026-09-21', '')).toBe('');
    });
  });
});
