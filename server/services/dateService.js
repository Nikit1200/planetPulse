/**
 * PlanetPulse Date and Week Service
 * Enforces authoritative Monday -> Sunday calendar week calculations (DP3).
 *
 * Timezone & Calendar Strategy:
 * PlanetPulse standardizes on UTC calendar day representations for date-only entries (YYYY-MM-DD).
 * When converting 'YYYY-MM-DD' strings, we construct an exact UTC midnight instance
 * (Date.UTC(y, m - 1, d)) to avoid unintended ±1 day boundary shifts caused by local UTC offsets.
 * All weekly start/end boundaries are computed strictly as:
 * - Start of week: Monday at 00:00:00.000 UTC
 * - End of week: Sunday at 23:59:59.999 UTC
 */

/**
 * Normalizes input date to a valid UTC Date object.
 * Avoids unintended timezone shifts for 'YYYY-MM-DD' date-only strings.
 *
 * @param {string|Date|number} [dateInput]
 * @returns {Date}
 */
const parseValidDate = (dateInput) => {
  if (!dateInput) return new Date();

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      throw new Error('Invalid Date instance provided');
    }
    return new Date(dateInput.getTime());
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Match date-only format YYYY-MM-DD
    const dateOnlyRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = trimmed.match(dateOnlyRegex);

    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      // Validate month bounds
      if (month < 1 || month > 12) {
        throw new Error('Invalid month value in date');
      }

      // Check days in month (handling leap years)
      const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      if (
        d.getUTCFullYear() !== year ||
        d.getUTCMonth() !== month - 1 ||
        d.getUTCDate() !== day
      ) {
        throw new Error('Invalid day value for the specified month/year');
      }
      return d;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date format');
  }
  return d;
};

/**
 * Returns the Monday 00:00:00.000 UTC of the week for the given date.
 * Accurately handles Monday through Sunday, month boundaries, and year boundaries.
 *
 * @param {Date|string|number} [date=new Date()]
 * @returns {Date}
 */
const getStartOfWeek = (date = new Date()) => {
  const d = parseValidDate(date);

  // UTC Day: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const day = d.getUTCDay();
  // If Sunday (0), Monday was 6 days ago.
  // Otherwise, Monday was (day - 1) days ago.
  const diffToMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
};

/**
 * Returns the Sunday 23:59:59.999 UTC of the week for the given date.
 * Accurately handles Monday through Sunday, month boundaries, and year boundaries.
 *
 * @param {Date|string|number} [date=new Date()]
 * @returns {Date}
 */
const getEndOfWeek = (date = new Date()) => {
  const start = getStartOfWeek(date);
  const sunday = new Date(start);
  sunday.setUTCDate(start.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return sunday;
};

/**
 * Returns the start and end of the current week (Monday 00:00 UTC to Sunday 23:59 UTC).
 *
 * @param {Date|string|number} [referenceDate=new Date()]
 * @returns {{ startOfWeek: Date, endOfWeek: Date, start: string, end: string, formattedRange: string }}
 */
const getCurrentWeekRange = (referenceDate = new Date()) => {
  const start = getStartOfWeek(referenceDate);
  const end = getEndOfWeek(referenceDate);

  const startFormatted = start.toISOString().split('T')[0];
  const endFormatted = end.toISOString().split('T')[0];

  return {
    startOfWeek: start,
    endOfWeek: end,
    start: startFormatted,
    end: endFormatted,
    formattedRange: `${startFormatted} to ${endFormatted}`
  };
};

/**
 * Checks if a given date falls within the current Monday-to-Sunday week.
 *
 * @param {Date|string|number} date
 * @param {Date|string|number} [referenceDate=new Date()]
 * @returns {boolean}
 */
const isInCurrentWeek = (date, referenceDate = new Date()) => {
  try {
    const d = parseValidDate(date);
    const { startOfWeek, endOfWeek } = getCurrentWeekRange(referenceDate);
    return d >= startOfWeek && d <= endOfWeek;
  } catch {
    return false;
  }
};

/**
 * Full day names ordered from Monday through Sunday.
 */
const FULL_DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * Short day names ordered from Monday through Sunday.
 */
const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Returns an array of 7 day objects from Monday to Sunday for the week.
 * Each entry includes the date string, full day name, and UTC boundaries.
 *
 * @param {Date|string|number} [referenceDate=new Date()]
 * @returns {Array<{ day: string, shortDay: string, date: string, start: Date, end: Date }>}
 */
const getWeekDays = (referenceDate = new Date()) => {
  const start = getStartOfWeek(referenceDate);

  return FULL_DAY_NAMES.map((dayName, index) => {
    const dayStart = new Date(start);
    dayStart.setUTCDate(dayStart.getUTCDate() + index);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);

    return {
      day: dayName,
      shortDay: SHORT_DAY_NAMES[index],
      date: dayStart.toISOString().split('T')[0],
      start: dayStart,
      end: dayEnd
    };
  });
};

module.exports = {
  parseValidDate,
  getStartOfWeek,
  getEndOfWeek,
  getCurrentWeekRange,
  isInCurrentWeek,
  getWeekDays,
  FULL_DAY_NAMES,
  SHORT_DAY_NAMES
};
