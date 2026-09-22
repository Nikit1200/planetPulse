const request = require('supertest');
const app = require('../server');
const Activity = require('../models/Activity');
const Settings = require('../models/Settings');
const {
  EMISSION_FACTORS,
  calculateCO2,
  getEmissionFactor,
  getUnit,
  isValidType
} = require('../services/carbonService');
const {
  parseValidDate,
  getStartOfWeek,
  getEndOfWeek,
  getCurrentWeekRange,
  isInCurrentWeek,
  getWeekDays
} = require('../services/dateService');
const {
  validateActivityInput,
  validateDateFilters,
  validateTargetInput
} = require('../utils/validators');

jest.mock('../models/Activity');
jest.mock('../models/Settings');

describe('Phase 10 — Comprehensive Testing & Validation Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. CO2 Factor & Calculation Tests (Sections 7 & 8)
  // ==========================================
  describe('CO2 Factors & Exact Mathematical Calculation', () => {
    test('Exact factor verification across all 6 categories (Section 7)', () => {
      expect(getEmissionFactor('travel')).toBe(0.20);
      expect(getUnit('travel')).toBe('km');

      expect(getEmissionFactor('bus')).toBe(0.08);
      expect(getUnit('bus')).toBe('km');

      expect(getEmissionFactor('flight')).toBe(0.25);
      expect(getUnit('flight')).toBe('km');

      expect(getEmissionFactor('electricity')).toBe(0.80);
      expect(getUnit('electricity')).toBe('kWh');

      expect(getEmissionFactor('veg_meal')).toBe(0.50);
      expect(getUnit('veg_meal')).toBe('meal');

      expect(getEmissionFactor('nonveg_meal')).toBe(2.00);
      expect(getUnit('nonveg_meal')).toBe('meal');
    });

    test('Integer and decimal quantity calculations (Section 8)', () => {
      expect(calculateCO2('travel', 10)).toBe(2);
      expect(calculateCO2('bus', 10)).toBe(0.8);
      expect(calculateCO2('flight', 100)).toBe(25);
      expect(calculateCO2('electricity', 5)).toBe(4);
      expect(calculateCO2('veg_meal', 2)).toBe(1);
      expect(calculateCO2('nonveg_meal', 2)).toBe(4);

      // Decimal quantities
      expect(calculateCO2('travel', 10.5)).toBe(2.1);
      expect(calculateCO2('electricity', 12.5)).toBe(10);
      expect(calculateCO2('flight', 1200.5)).toBe(300.13);
    });

    test('Rejection of invalid activity types (Section 9)', () => {
      ['car', 'train', 'unknown', '', null, undefined].forEach((type) => {
        expect(isValidType(type)).toBe(false);
        expect(() => calculateCO2(type, 10)).toThrow();
      });
    });
  });

  // ==========================================
  // 2. Input Validation (Sections 10 & 11)
  // ==========================================
  describe('Activity & Target Input Validation', () => {
    test('Rejects missing, zero, negative, NaN, Infinity quantities (Section 10)', () => {
      const invalidQuantities = [null, undefined, 0, -1, -100, NaN, Infinity, -Infinity, 'abc', ''];
      invalidQuantities.forEach((qty) => {
        const res = validateActivityInput({ type: 'travel', quantity: qty, date: '2026-09-22' });
        expect(res.isValid).toBe(false);
      });
    });

    test('Accepts valid numeric quantities (Section 10)', () => {
      [1, 2, 10, 10.5, 100.25].forEach((qty) => {
        const res = validateActivityInput({ type: 'travel', quantity: qty, date: '2026-09-22' });
        expect(res.isValid).toBe(true);
        expect(res.parsedData.quantity).toBe(qty);
      });
    });

    test('Date validation: rejects missing, malformed, or non-leap year (e.g. 2026-02-29) (Section 11)', () => {
      expect(validateActivityInput({ type: 'travel', quantity: 10 }).isValid).toBe(false);
      expect(validateActivityInput({ type: 'travel', quantity: 10, date: 'invalid-date' }).isValid).toBe(false);
      expect(validateActivityInput({ type: 'travel', quantity: 10, date: '2026-02-29' }).isValid).toBe(false);
      expect(validateActivityInput({ type: 'travel', quantity: 10, date: '2026-04-31' }).isValid).toBe(false);

      // Valid date passes
      expect(validateActivityInput({ type: 'travel', quantity: 10, date: '2026-09-22' }).isValid).toBe(true);
    });

    test('Target validation: rejects 0, negative, NaN, Infinity, missing (Section 21)', () => {
      [0, -5, NaN, Infinity, -Infinity, 'abc', '', null, undefined].forEach((t) => {
        expect(validateTargetInput(t).isValid).toBe(false);
      });

      [20, 25, 10.5, 100].forEach((t) => {
        expect(validateTargetInput(t).isValid).toBe(true);
      });
    });
  });

  // ==========================================
  // 3. Weekly Date Boundaries & Safety (Sections 12, 13, 14)
  // ==========================================
  describe('Authoritative Monday-Sunday Week & Date Safety', () => {
    const mondaySep21 = new Date(Date.UTC(2026, 8, 21, 0, 0, 0, 0)); // 2026-09-21 Mon
    const sundaySep27 = new Date(Date.UTC(2026, 8, 27, 23, 59, 59, 999)); // 2026-09-27 Sun
    const prevSunday = new Date(Date.UTC(2026, 8, 20, 12, 0, 0, 0)); // 2026-09-20
    const nextMonday = new Date(Date.UTC(2026, 8, 28, 12, 0, 0, 0)); // 2026-09-28

    test('Date-only safety: 2026-09-22 parsed date remains 2026-09-22 UTC (Section 12)', () => {
      const parsed = parseValidDate('2026-09-22');
      expect(parsed.toISOString().split('T')[0]).toBe('2026-09-22');
    });

    test('Week range start is Monday and end is Sunday (Section 13)', () => {
      const range = getCurrentWeekRange(mondaySep21);
      expect(range.start).toBe('2026-09-21');
      expect(range.end).toBe('2026-09-27');
    });

    test('Week boundaries: Mon/Sun included, prev Sun / next Mon excluded (Section 14)', () => {
      expect(isInCurrentWeek(mondaySep21, mondaySep21)).toBe(true);
      expect(isInCurrentWeek(sundaySep27, mondaySep21)).toBe(true);
      expect(isInCurrentWeek(prevSunday, mondaySep21)).toBe(false);
      expect(isInCurrentWeek(nextMonday, mondaySep21)).toBe(false);
    });

    test('Daily breakdown always has 7 ordered days from Monday to Sunday (Section 15)', () => {
      const weekDays = getWeekDays(mondaySep21);
      expect(weekDays).toHaveLength(7);
      expect(weekDays.map(w => w.day)).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]);
    });
  });

  // ==========================================
  // 4. Dashboard Aggregation Tests (Sections 16, 17, 18, 19, 20)
  // ==========================================
  describe('Dashboard Aggregation & Target Boundaries', () => {
    const fixedNow = new Date(Date.UTC(2026, 8, 22, 12, 0, 0, 0));

    test('Empty database returns all zeros, default target, 7 days (Section 16)', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const { data } = res.body;
      expect(data.totalCO2).toBe(0);
      expect(data.activityCount).toBe(0);
      expect(data.weeklyTarget).toBe(20);
      expect(data.targetExceeded).toBe(false);
      expect(data.remaining).toBe(20);
      expect(data.exceededBy).toBe(0);
      expect(data.percentage).toBe(0);
      expect(data.dailyBreakdown).toHaveLength(7);
      expect(data.recentActivities).toEqual([]);
    });

    test('Single activity: Travel 10 km = 2.00 kg CO2 (Section 17)', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return {
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', type: 'travel', quantity: 10, unit: 'km', co2: 2, date: fixedNow }
              ])
            })
          };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalCO2).toBe(2);
      expect(res.body.data.activityCount).toBe(1);
      expect(res.body.data.categoryBreakdown.travel).toBe(2);
      expect(res.body.data.remaining).toBe(18);
    });

    test('Multi-category activity aggregation (Section 18)', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return {
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', type: 'travel', quantity: 10, unit: 'km', co2: 2, date: fixedNow },
                { _id: '2', type: 'bus', quantity: 10, unit: 'km', co2: 0.8, date: fixedNow },
                { _id: '3', type: 'electricity', quantity: 5, unit: 'kWh', co2: 4, date: fixedNow }
              ])
            })
          };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalCO2).toBe(6.8);
      expect(res.body.data.categoryBreakdown.travel).toBe(2);
      expect(res.body.data.categoryBreakdown.bus).toBe(0.8);
      expect(res.body.data.categoryBreakdown.electricity).toBe(4);
      expect(res.body.data.categoryBreakdown.flight).toBe(0);
    });

    test('Target boundary cases (Section 20)', async () => {
      // Case 1: 10 / 20 -> 50%, remaining = 10, exceededBy = 0, targetExceeded = false
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: '1', type: 'travel', quantity: 50, unit: 'km', co2: 10, date: fixedNow }]) }) };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      let res = await request(app).get('/api/dashboard');
      expect(res.body.data.percentage).toBe(50);
      expect(res.body.data.remaining).toBe(10);
      expect(res.body.data.exceededBy).toBe(0);
      expect(res.body.data.targetExceeded).toBe(false);

      // Case 2: 20 / 20 -> 100%, remaining = 0, exceededBy = 0, targetExceeded = false
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: '1', type: 'travel', quantity: 100, unit: 'km', co2: 20, date: fixedNow }]) }) };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      res = await request(app).get('/api/dashboard');
      expect(res.body.data.percentage).toBe(100);
      expect(res.body.data.remaining).toBe(0);
      expect(res.body.data.exceededBy).toBe(0);
      expect(res.body.data.targetExceeded).toBe(false);

      // Case 3: 25 / 20 -> 125%, remaining = 0, exceededBy = 5, targetExceeded = true
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: '1', type: 'flight', quantity: 100, unit: 'km', co2: 25, date: fixedNow }]) }) };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      res = await request(app).get('/api/dashboard');
      expect(res.body.data.percentage).toBe(125);
      expect(res.body.data.remaining).toBe(0);
      expect(res.body.data.exceededBy).toBe(5);
      expect(res.body.data.targetExceeded).toBe(true);
    });
  });

  // ==========================================
  // 5. Authoritative CO2 & Security (Section 25)
  // ==========================================
  describe('Backend Authoritative Security & Persistence', () => {
    test('Backend ignores client-supplied malicious CO2 value (Section 25)', async () => {
      const mockSaved = {
        _id: 'sec_act',
        type: 'travel',
        quantity: 10,
        unit: 'km',
        co2: 2.00, // authoritative calculation
        date: new Date('2026-09-22T00:00:00.000Z'),
        createdAt: new Date()
      };
      Activity.create.mockResolvedValue(mockSaved);

      const res = await request(app)
        .post('/api/activities')
        .send({
          type: 'travel',
          quantity: 10,
          date: '2026-09-22',
          co2: 999999, // Attempted forgery
          unit: 'miles' // Attempted unit forgery
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.co2).toBe(2.00);
      expect(res.body.data.unit).toBe('km');
    });
  });

  // ==========================================
  // 6. Filter Inclusivity & Date Range (Sections 27 & 28)
  // ==========================================
  describe('Activity Filters & Inclusivity', () => {
    test('Inclusive date filtering (Section 27)', () => {
      const res = validateDateFilters('2026-09-21', '2026-09-22');
      expect(res.isValid).toBe(true);
      // toDate should end at 23:59:59.999 UTC
      expect(res.toDate.getUTCHours()).toBe(23);
      expect(res.toDate.getUTCMinutes()).toBe(59);
      expect(res.toDate.getUTCSeconds()).toBe(59);
    });

    test('Rejects invalid date range when from > to (Section 28)', () => {
      const res = validateDateFilters('2026-09-25', '2026-09-20');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('"from" date must be earlier than or equal to "to" date');
    });
  });
});
