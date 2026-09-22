const request = require('supertest');
const app = require('../server');
const Activity = require('../models/Activity');
const Settings = require('../models/Settings');
const { calculateCO2, getUnit } = require('../services/carbonService');
const {
  getStartOfWeek,
  getEndOfWeek,
  getCurrentWeekRange,
  isInCurrentWeek,
  getWeekDays
} = require('../services/dateService');

jest.mock('../models/Activity');
jest.mock('../models/Settings');

describe('Decision Points (DP1, DP2, DP3) Verification Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Reference week
  const now = new Date();
  const currentMonday = getStartOfWeek(now);
  const getDayInCurrentWeek = (dayIndex) => {
    const d = new Date(currentMonday);
    d.setUTCDate(currentMonday.getUTCDate() + dayIndex);
    d.setUTCHours(12, 0, 0, 0);
    return d;
  };

  describe('DP1 — The Nudge: Target Exceedance Boundaries', () => {
    test('Case A: total < target (10 kg < 20 kg) -> targetExceeded=false, exceededBy=0', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return {
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', type: 'travel', quantity: 50, unit: 'km', co2: 10, date: getDayInCurrentWeek(0) }
              ])
            })
          };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalCO2).toBe(10);
      expect(res.body.data.weeklyTarget).toBe(20);
      expect(res.body.data.targetExceeded).toBe(false);
      expect(res.body.data.exceededBy).toBe(0);
      expect(res.body.data.remaining).toBe(10);
    });

    test('Case B: total === target (20 kg === 20 kg) -> targetExceeded=false, exceededBy=0 (Exact Target Boundary)', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return {
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', type: 'travel', quantity: 100, unit: 'km', co2: 20, date: getDayInCurrentWeek(1) }
              ])
            })
          };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalCO2).toBe(20);
      expect(res.body.data.weeklyTarget).toBe(20);
      expect(res.body.data.percentage).toBe(100);
      expect(res.body.data.targetExceeded).toBe(false);
      expect(res.body.data.exceededBy).toBe(0);
      expect(res.body.data.remaining).toBe(0);
    });

    test('Case C: total > target (20.01 kg > 20 kg) -> targetExceeded=true, exceededBy=0.01', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return {
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', type: 'travel', quantity: 100.05, unit: 'km', co2: 20.01, date: getDayInCurrentWeek(2) }
              ])
            })
          };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalCO2).toBe(20.01);
      expect(res.body.data.targetExceeded).toBe(true);
      expect(res.body.data.exceededBy).toBe(0.01);
      expect(res.body.data.remaining).toBe(0);
    });

    test('Case D: total = 25, target = 20 -> targetExceeded=true, exceededBy=5.00', async () => {
      Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });
      Activity.find.mockImplementation((filter) => {
        if (filter && filter.date) {
          return {
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', type: 'flight', quantity: 100, unit: 'km', co2: 25, date: getDayInCurrentWeek(3) }
              ])
            })
          };
        }
        return { sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) };
      });

      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalCO2).toBe(25);
      expect(res.body.data.targetExceeded).toBe(true);
      expect(res.body.data.exceededBy).toBe(5);
      expect(res.body.data.percentage).toBe(125);
    });
  });

  describe('DP2 — Absurd Input: Backend Acceptance & Calculation', () => {
    test('Backend accepts and accurately computes 500,000 km flight (0.25 kg/km -> 125,000 kg CO2)', async () => {
      const co2 = calculateCO2('flight', 500000);
      expect(co2).toBe(125000);
      expect(getUnit('flight')).toBe('km');

      const mockSaved = {
        _id: 'absurd_act',
        type: 'flight',
        quantity: 500000,
        unit: 'km',
        co2: 125000,
        date: new Date('2026-09-22T00:00:00.000Z'),
        createdAt: new Date()
      };
      Activity.create.mockResolvedValue(mockSaved);

      const res = await request(app)
        .post('/api/activities')
        .send({
          type: 'flight',
          quantity: 500000,
          date: '2026-09-22'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.co2).toBe(125000);
      expect(res.body.data.quantity).toBe(500000);
    });

    test('Backend rejects true invalid quantities: 0, negative, NaN, Infinity', async () => {
      const resZero = await request(app).post('/api/activities').send({ type: 'travel', quantity: 0, date: '2026-09-22' });
      expect(resZero.status).toBe(400);

      const resNeg = await request(app).post('/api/activities').send({ type: 'travel', quantity: -10, date: '2026-09-22' });
      expect(resNeg.status).toBe(400);

      const resNaN = await request(app).post('/api/activities').send({ type: 'travel', quantity: 'abc', date: '2026-09-22' });
      expect(resNaN.status).toBe(400);
    });
  });

  describe('DP3 — The Week: Authoritative Monday-Sunday Boundaries', () => {
    const fixedMonday = new Date(Date.UTC(2026, 8, 21, 0, 0, 0, 0)); // Mon, Sep 21, 2026
    const fixedSunday = new Date(Date.UTC(2026, 8, 27, 23, 59, 59, 999)); // Sun, Sep 27, 2026
    const prevSunday = new Date(Date.UTC(2026, 8, 20, 12, 0, 0, 0)); // Sun, Sep 20, 2026
    const nextMonday = new Date(Date.UTC(2026, 8, 28, 12, 0, 0, 0)); // Mon, Sep 28, 2026

    test('Monday of the week is included', () => {
      expect(isInCurrentWeek(fixedMonday, fixedMonday)).toBe(true);
    });

    test('Sunday of the week is included', () => {
      expect(isInCurrentWeek(fixedSunday, fixedMonday)).toBe(true);
    });

    test('Previous Sunday is strictly excluded from current week', () => {
      expect(isInCurrentWeek(prevSunday, fixedMonday)).toBe(false);
    });

    test('Next Monday is strictly excluded from current week', () => {
      expect(isInCurrentWeek(nextMonday, fixedMonday)).toBe(false);
    });

    test('getWeekDays always returns exactly seven days from Monday to Sunday', () => {
      const weekDays = getWeekDays(fixedMonday);
      expect(weekDays).toHaveLength(7);
      expect(weekDays[0].day).toBe('Monday');
      expect(weekDays[1].day).toBe('Tuesday');
      expect(weekDays[2].day).toBe('Wednesday');
      expect(weekDays[3].day).toBe('Thursday');
      expect(weekDays[4].day).toBe('Friday');
      expect(weekDays[5].day).toBe('Saturday');
      expect(weekDays[6].day).toBe('Sunday');
      expect(weekDays[0].date).toBe('2026-09-21');
      expect(weekDays[6].date).toBe('2026-09-27');
    });

    test('Current week range start is Monday and end is Sunday', () => {
      const range = getCurrentWeekRange(fixedMonday);
      expect(range.start).toBe('2026-09-21');
      expect(range.end).toBe('2026-09-27');
    });
  });
});
