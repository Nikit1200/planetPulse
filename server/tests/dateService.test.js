const {
  getStartOfWeek,
  getEndOfWeek,
  getCurrentWeekRange,
  isInCurrentWeek,
  getWeekDays,
  parseValidDate
} = require('../services/dateService');

describe('Date Service - Complete Week Tests (Monday -> Sunday UTC)', () => {
  describe('Individual Days of the Week Mapping (Mon -> Sun in Sep 2026)', () => {
    // Reference week: Monday Sep 21 to Sunday Sep 27, 2026
    const expectedMondayDate = 21;
    const expectedSundayDate = 27;

    test('Monday (2026-09-21) maps to itself as start of week', () => {
      const mon = new Date('2026-09-21T09:00:00.000Z');
      const start = getStartOfWeek(mon);
      const end = getEndOfWeek(mon);

      expect(start.getUTCDay()).toBe(1); // Monday
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDay()).toBe(0); // Sunday
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });

    test('Tuesday (2026-09-22) maps to preceding Monday', () => {
      const tue = new Date('2026-09-22T14:30:00.000Z');
      const start = getStartOfWeek(tue);
      const end = getEndOfWeek(tue);

      expect(start.getUTCDay()).toBe(1);
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });

    test('Wednesday (2026-09-23) maps to preceding Monday', () => {
      const wed = new Date('2026-09-23T18:00:00.000Z');
      const start = getStartOfWeek(wed);
      const end = getEndOfWeek(wed);

      expect(start.getUTCDay()).toBe(1);
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });

    test('Thursday (2026-09-24) maps to preceding Monday', () => {
      const thu = new Date('2026-09-24T11:15:00.000Z');
      const start = getStartOfWeek(thu);
      const end = getEndOfWeek(thu);

      expect(start.getUTCDay()).toBe(1);
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });

    test('Friday (2026-09-25) maps to preceding Monday', () => {
      const fri = new Date('2026-09-25T23:45:00.000Z');
      const start = getStartOfWeek(fri);
      const end = getEndOfWeek(fri);

      expect(start.getUTCDay()).toBe(1);
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });

    test('Saturday (2026-09-26) maps to preceding Monday', () => {
      const sat = new Date('2026-09-26T08:00:00.000Z');
      const start = getStartOfWeek(sat);
      const end = getEndOfWeek(sat);

      expect(start.getUTCDay()).toBe(1);
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });

    test('Sunday (2026-09-27) maps to Monday of the same week, not next week', () => {
      const sun = new Date('2026-09-27T22:00:00.000Z');
      const start = getStartOfWeek(sun);
      const end = getEndOfWeek(sun);

      expect(start.getUTCDay()).toBe(1);
      expect(start.getUTCDate()).toBe(expectedMondayDate);
      expect(end.getUTCDay()).toBe(0);
      expect(end.getUTCDate()).toBe(expectedSundayDate);
    });
  });

  describe('Month Boundary Calculation', () => {
    // Week spanning Oct 26 (Monday) to Nov 1 (Sunday), 2026
    test('Handles week that spans across month boundaries (October -> November)', () => {
      const saturdayInOct = new Date('2026-10-31T15:00:00.000Z');
      const sundayInNov = new Date('2026-11-01T10:00:00.000Z');

      const startFromOct = getStartOfWeek(saturdayInOct);
      const endFromOct = getEndOfWeek(saturdayInOct);

      const startFromNov = getStartOfWeek(sundayInNov);
      const endFromNov = getEndOfWeek(sundayInNov);

      // Both must resolve to Monday Oct 26, 2026
      expect(startFromOct.toISOString()).toBe('2026-10-26T00:00:00.000Z');
      expect(startFromNov.toISOString()).toBe('2026-10-26T00:00:00.000Z');

      // Both must resolve to Sunday Nov 1, 2026
      expect(endFromOct.toISOString()).toBe('2026-11-01T23:59:59.999Z');
      expect(endFromNov.toISOString()).toBe('2026-11-01T23:59:59.999Z');
    });
  });

  describe('Year Boundary Calculation', () => {
    // Week spanning Dec 29, 2025 (Monday) to Jan 4, 2026 (Sunday)
    test('Handles week that spans across year boundaries (Dec 2025 -> Jan 2026)', () => {
      const wednesdayInDec = new Date('2025-12-31T20:00:00.000Z');
      const thursdayInJan = new Date('2026-01-01T04:00:00.000Z');

      const startDec = getStartOfWeek(wednesdayInDec);
      const endDec = getEndOfWeek(wednesdayInDec);

      const startJan = getStartOfWeek(thursdayInJan);
      const endJan = getEndOfWeek(thursdayInJan);

      // Both must resolve to Monday Dec 29, 2025
      expect(startDec.toISOString()).toBe('2025-12-29T00:00:00.000Z');
      expect(startJan.toISOString()).toBe('2025-12-29T00:00:00.000Z');

      // Both must resolve to Sunday Jan 4, 2026
      expect(endDec.toISOString()).toBe('2026-01-04T23:59:59.999Z');
      expect(endJan.toISOString()).toBe('2026-01-04T23:59:59.999Z');
    });
  });

  describe('Week Days and Ranges', () => {
    test('getWeekDays produces 7 ordered days from Monday to Sunday', () => {
      const days = getWeekDays('2026-09-23');
      expect(days).toHaveLength(7);
      expect(days.map((d) => d.day)).toEqual([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ]);
      expect(days.map((d) => d.shortDay)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      expect(days[0].date).toBe('2026-09-21');
      expect(days[6].date).toBe('2026-09-27');
    });

    test('getCurrentWeekRange formats range string accurately', () => {
      const range = getCurrentWeekRange('2026-09-23');
      expect(range.formattedRange).toBe('2026-09-21 to 2026-09-27');
    });

    test('isInCurrentWeek accurately identifies in-range and out-of-range dates', () => {
      const ref = new Date('2026-09-23T12:00:00.000Z');
      expect(isInCurrentWeek('2026-09-21', ref)).toBe(true);
      expect(isInCurrentWeek('2026-09-27', ref)).toBe(true);
      expect(isInCurrentWeek('2026-09-20', ref)).toBe(false);
      expect(isInCurrentWeek('2026-09-28', ref)).toBe(false);
    });
  });

  describe('parseValidDate and Timezone Safety', () => {
    test('Parses YYYY-MM-DD into exact UTC midnight', () => {
      const d = parseValidDate('2026-09-22');
      expect(d.toISOString()).toBe('2026-09-22T00:00:00.000Z');
      expect(d.getUTCFullYear()).toBe(2026);
      expect(d.getUTCMonth()).toBe(8); // September is 8 (0-indexed)
      expect(d.getUTCDate()).toBe(22);
      expect(d.getUTCHours()).toBe(0);
    });

    test('Rejects invalid calendar month or day', () => {
      expect(() => parseValidDate('2026-13-01')).toThrow('Invalid month value');
      expect(() => parseValidDate('2026-02-30')).toThrow('Invalid day value');
      expect(() => parseValidDate('invalid-str')).toThrow('Invalid date format');
    });
  });
});
