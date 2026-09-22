const {
  validateActivityInput,
  isValidObjectId,
  validateDateFilters,
  validateTargetInput
} = require('../utils/validators');

describe('Activity & Target Validators (server/utils/validators.js)', () => {
  describe('validateActivityInput', () => {
    test('Accepts valid input and parses types correctly', () => {
      const result = validateActivityInput({
        type: 'travel',
        quantity: 15.5,
        date: '2026-09-22'
      });
      expect(result.isValid).toBe(true);
      expect(result.parsedData.type).toBe('travel');
      expect(result.parsedData.quantity).toBe(15.5);
      expect(result.parsedData.date).toBeInstanceOf(Date);
    });

    test('Rejects non-object or null data', () => {
      expect(validateActivityInput(null).isValid).toBe(false);
      expect(validateActivityInput('string').isValid).toBe(false);
    });

    test('Rejects missing type', () => {
      const res = validateActivityInput({ quantity: 10, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Activity type is required');
    });

    test('Rejects unsupported activity type', () => {
      const res = validateActivityInput({ type: 'rocket', quantity: 10, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Unsupported activity type');
    });

    test('Rejects missing quantity', () => {
      const res = validateActivityInput({ type: 'travel', date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Quantity is required');
    });

    test('Rejects quantity = 0', () => {
      const res = validateActivityInput({ type: 'travel', quantity: 0, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('greater than zero');
    });

    test('Rejects quantity < 0', () => {
      const res = validateActivityInput({ type: 'travel', quantity: -10, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('greater than zero');
    });

    test('Rejects quantity = "abc"', () => {
      const res = validateActivityInput({ type: 'travel', quantity: 'abc', date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('greater than zero');
    });

    test('Rejects quantity = NaN', () => {
      const res = validateActivityInput({ type: 'travel', quantity: NaN, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('greater than zero');
    });

    test('Rejects quantity = Infinity', () => {
      const res = validateActivityInput({ type: 'travel', quantity: Infinity, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('greater than zero');
    });

    test('Rejects boolean quantity', () => {
      const res = validateActivityInput({ type: 'travel', quantity: true, date: '2026-09-22' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('greater than zero');
    });

    test('Rejects missing date', () => {
      const res = validateActivityInput({ type: 'travel', quantity: 10 });
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Date is required');
    });

    test('Rejects invalid date string', () => {
      const res = validateActivityInput({ type: 'travel', quantity: 10, date: 'invalid-date' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid date provided');
    });

    test('Rejects invalid calendar days (e.g. Feb 31)', () => {
      const res = validateActivityInput({ type: 'travel', quantity: 10, date: '2026-02-31' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Invalid date provided');
    });
  });

  describe('isValidObjectId', () => {
    test('Validates 24-character hex MongoDB ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('673f4b82d9a3b8112c3f81e1')).toBe(true);
    });

    test('Rejects non-hex or malformed strings', () => {
      expect(isValidObjectId('123')).toBe(false);
      expect(isValidObjectId('not-an-id')).toBe(false);
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId(undefined)).toBe(false);
      expect(isValidObjectId({})).toBe(false);
    });
  });

  describe('validateDateFilters', () => {
    test('Accepts valid from and to dates', () => {
      const res = validateDateFilters('2026-09-21', '2026-09-27');
      expect(res.isValid).toBe(true);
      expect(res.fromDate).toBeInstanceOf(Date);
      expect(res.toDate).toBeInstanceOf(Date);
    });

    test('Accepts only from date', () => {
      const res = validateDateFilters('2026-09-21', null);
      expect(res.isValid).toBe(true);
      expect(res.fromDate).toBeInstanceOf(Date);
      expect(res.toDate).toBeNull();
    });

    test('Accepts only to date', () => {
      const res = validateDateFilters(null, '2026-09-27');
      expect(res.isValid).toBe(true);
      expect(res.fromDate).toBeNull();
      expect(res.toDate).toBeInstanceOf(Date);
    });

    test('Rejects when from date is after to date', () => {
      const res = validateDateFilters('2026-09-28', '2026-09-21');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('"from" date must be earlier');
    });

    test('Rejects malformed date strings', () => {
      expect(validateDateFilters('bad-date', '2026-09-27').isValid).toBe(false);
      expect(validateDateFilters('2026-09-21', 'bad-date').isValid).toBe(false);
    });
  });

  describe('validateTargetInput', () => {
    test('Accepts valid positive targets and rounds to 2 decimals', () => {
      expect(validateTargetInput(25)).toEqual({ isValid: true, target: 25 });
      expect(validateTargetInput('30.456')).toEqual({ isValid: true, target: 30.46 });
    });

    test('Rejects zero or negative targets', () => {
      expect(validateTargetInput(0).isValid).toBe(false);
      expect(validateTargetInput(-5).isValid).toBe(false);
    });

    test('Rejects non-numeric values', () => {
      expect(validateTargetInput('abc').isValid).toBe(false);
      expect(validateTargetInput(NaN).isValid).toBe(false);
      expect(validateTargetInput(Infinity).isValid).toBe(false);
      expect(validateTargetInput(null).isValid).toBe(false);
      expect(validateTargetInput(true).isValid).toBe(false);
    });
  });
});
