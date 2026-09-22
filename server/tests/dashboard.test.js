const request = require('supertest');
const app = require('../server');
const Activity = require('../models/Activity');
const Settings = require('../models/Settings');
const { getStartOfWeek, getWeekDays } = require('../services/dateService');

// Mock Mongoose models for deterministic unit/integration testing
jest.mock('../models/Activity');
jest.mock('../models/Settings');

describe('Dashboard API & Weekly Aggregation Tests (Phase 3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const now = new Date();
  const currentMonday = getStartOfWeek(now);

  const getDayInCurrentWeek = (dayIndex) => {
    // dayIndex: 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
    const d = new Date(currentMonday);
    d.setUTCDate(currentMonday.getUTCDate() + dayIndex);
    d.setUTCHours(12, 0, 0, 0);
    return d;
  };

  test('1. Empty database: returns 0 totalCO2, default target, full 7 days zeroed, all categories 0, empty recents', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        // week activities query
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        };
      }
      // recent activities query
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { data } = res.body;
    expect(data.totalCO2).toBe(0);
    expect(data.weeklyTarget).toBe(20);
    expect(data.percentage).toBe(0);
    expect(data.remaining).toBe(20);
    expect(data.exceededBy).toBe(0);
    expect(data.targetExceeded).toBe(false);
    expect(data.activityCount).toBe(0);

    // Verify all 6 categories present and 0
    expect(data.categoryBreakdown).toEqual({
      travel: 0,
      bus: 0,
      flight: 0,
      electricity: 0,
      veg_meal: 0,
      nonveg_meal: 0
    });

    // Verify all 7 days present
    expect(data.dailyBreakdown).toHaveLength(7);
    expect(data.dailyBreakdown[0].day).toBe('Monday');
    expect(data.dailyBreakdown[6].day).toBe('Sunday');
    data.dailyBreakdown.forEach((dayEntry) => {
      expect(dayEntry.co2).toBe(0);
      expect(dayEntry.activityCount).toBe(0);
    });

    expect(data.recentActivities).toEqual([]);
    expect(data.week).toHaveProperty('start');
    expect(data.week).toHaveProperty('end');
  });

  test('2. One activity: Travel 10 km = 2.00 kg CO2', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockActivities = [
      {
        _id: 'act1',
        type: 'travel',
        quantity: 10,
        unit: 'km',
        co2: 2,
        date: getDayInCurrentWeek(0), // Monday
        createdAt: new Date()
      }
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCO2).toBe(2);
    expect(res.body.data.activityCount).toBe(1);
    expect(res.body.data.percentage).toBe(10); // 2 / 20 * 100
    expect(res.body.data.remaining).toBe(18); // 20 - 2
    expect(res.body.data.exceededBy).toBe(0);
    expect(res.body.data.targetExceeded).toBe(false);
    expect(res.body.data.categoryBreakdown.travel).toBe(2);
  });

  test('3. Multiple activity types: verifies category totals and weekly sum (7.8 kg)', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockActivities = [
      { _id: '1', type: 'travel', quantity: 10, unit: 'km', co2: 2, date: getDayInCurrentWeek(0) },
      { _id: '2', type: 'electricity', quantity: 5, unit: 'kWh', co2: 4, date: getDayInCurrentWeek(1) },
      { _id: '3', type: 'bus', quantity: 10, unit: 'km', co2: 0.8, date: getDayInCurrentWeek(2) },
      { _id: '4', type: 'veg_meal', quantity: 2, unit: 'meal', co2: 1, date: getDayInCurrentWeek(3) }
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const { data } = res.body;
    expect(data.totalCO2).toBe(7.8);
    expect(data.activityCount).toBe(4);
    expect(data.categoryBreakdown).toEqual({
      travel: 2,
      bus: 0.8,
      flight: 0,
      electricity: 4,
      veg_meal: 1,
      nonveg_meal: 0
    });
    expect(data.percentage).toBe(39); // 7.8 / 20 * 100
    expect(data.remaining).toBe(12.2); // 20 - 7.8
    expect(data.exceededBy).toBe(0);
    expect(data.targetExceeded).toBe(false);
  });

  test('4. Multiple days: verifies daily breakdown groups into respective calendar days', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockActivities = [
      { _id: '1', type: 'travel', co2: 2.5, date: getDayInCurrentWeek(0) }, // Mon
      { _id: '2', type: 'bus', co2: 1.5, date: getDayInCurrentWeek(0) },    // Mon
      { _id: '3', type: 'electricity', co2: 4.0, date: getDayInCurrentWeek(1) } // Tue
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const { dailyBreakdown } = res.body.data;
    // Monday (index 0): 2 activities, 4.0 kg CO2
    expect(dailyBreakdown[0].day).toBe('Monday');
    expect(dailyBreakdown[0].co2).toBe(4.0);
    expect(dailyBreakdown[0].activityCount).toBe(2);

    // Tuesday (index 1): 1 activity, 4.0 kg CO2
    expect(dailyBreakdown[1].day).toBe('Tuesday');
    expect(dailyBreakdown[1].co2).toBe(4.0);
    expect(dailyBreakdown[1].activityCount).toBe(1);

    // Wednesday (index 2): 0 activities, 0 kg CO2
    expect(dailyBreakdown[2].day).toBe('Wednesday');
    expect(dailyBreakdown[2].co2).toBe(0);
    expect(dailyBreakdown[2].activityCount).toBe(0);
  });

  test('5, 6, 7. Activities outside current week (previous or next week) are strictly excluded by date range', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    // The Activity.find filter should strictly enforce $gte startOfWeek and $lte endOfWeek
    let appliedFilter = null;
    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        appliedFilter = filter;
        // Simulating DB: only returns activities matching the week boundary
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              { _id: 'curr1', type: 'travel', co2: 2, date: getDayInCurrentWeek(2) }
            ])
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(appliedFilter).toBeDefined();
    expect(appliedFilter.date).toHaveProperty('$gte');
    expect(appliedFilter.date).toHaveProperty('$lte');

    // Total must only be 2, excluding out-of-week entries
    expect(res.body.data.totalCO2).toBe(2);
  });

  test('8. Target below total: 23.4 kg against 20 kg target (targetExceeded=true, remaining=0, exceededBy=3.4)', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockActivities = [
      { _id: '1', type: 'flight', co2: 23.4, date: getDayInCurrentWeek(1) }
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const { data } = res.body;
    expect(data.totalCO2).toBe(23.4);
    expect(data.weeklyTarget).toBe(20);
    expect(data.percentage).toBe(117);
    expect(data.targetExceeded).toBe(true);
    expect(data.remaining).toBe(0);
    expect(data.exceededBy).toBe(3.4);
  });

  test('9. Total exactly equal to target: 20 kg against 20 kg target (targetExceeded=false, remaining=0, exceededBy=0, percentage=100)', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockActivities = [
      { _id: '1', type: 'travel', co2: 20, date: getDayInCurrentWeek(2) }
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const { data } = res.body;
    expect(data.totalCO2).toBe(20);
    expect(data.weeklyTarget).toBe(20);
    expect(data.percentage).toBe(100);
    expect(data.targetExceeded).toBe(false); // Exactly reaching target is NOT exceeding it
    expect(data.remaining).toBe(0);
    expect(data.exceededBy).toBe(0);
  });

  test('10. Total slightly above target: 20.01 kg against 20 kg target (targetExceeded=true, remaining=0, exceededBy=0.01)', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockActivities = [
      { _id: '1', type: 'travel', co2: 20.01, date: getDayInCurrentWeek(3) }
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockActivities)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const { data } = res.body;
    expect(data.totalCO2).toBe(20.01);
    expect(data.weeklyTarget).toBe(20);
    expect(data.percentage).toBe(100.05); // 20.01 / 20 * 100 = 100.05
    expect(data.targetExceeded).toBe(true);
    expect(data.remaining).toBe(0);
    expect(data.exceededBy).toBe(0.01);
  });

  test('11. Recent activities: returns up to 5 newest-first items with clean properties', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    const mockRecent = [
      { _id: 'act5', type: 'travel', quantity: 10, unit: 'km', co2: 2, date: new Date('2026-09-25'), createdAt: new Date('2026-09-25') },
      { _id: 'act4', type: 'bus', quantity: 15, unit: 'km', co2: 1.2, date: new Date('2026-09-24'), createdAt: new Date('2026-09-24') },
      { _id: 'act3', type: 'electricity', quantity: 5, unit: 'kWh', co2: 4, date: new Date('2026-09-23'), createdAt: new Date('2026-09-23') }
    ];

    Activity.find.mockImplementation((filter) => {
      if (filter && filter.date) {
        return {
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        };
      }
      return {
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockRecent)
          })
        })
      };
    });

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const { recentActivities } = res.body.data;
    expect(recentActivities).toHaveLength(3);
    expect(recentActivities[0].id).toBe('act5');
    expect(recentActivities[1].id).toBe('act4');
    expect(recentActivities[2].id).toBe('act3');
    expect(recentActivities[0]).toHaveProperty('type');
    expect(recentActivities[0]).toHaveProperty('quantity');
    expect(recentActivities[0]).toHaveProperty('unit');
    expect(recentActivities[0]).toHaveProperty('co2');
    expect(recentActivities[0]).toHaveProperty('date');
  });

  test('12. All seven days: dailyBreakdown always contains exactly 7 items ordered Monday through Sunday', async () => {
    Settings.findOneAndUpdate.mockResolvedValue({ weeklyTarget: 20 });

    Activity.find.mockImplementation(() => ({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      })
    }));

    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);

    const days = res.body.data.dailyBreakdown;
    expect(days).toHaveLength(7);
    const dayNames = days.map((d) => d.day);
    expect(dayNames).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ]);
  });
});
