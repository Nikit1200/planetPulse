export const formatCO2 = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatQuantity = (quantity, unit) => {
  const num = Number(quantity);
  const formattedNum = isNaN(num) ? quantity : num.toLocaleString('en-US');
  return `${formattedNum} ${unit}`;
};

/**
 * Formats a YYYY-MM-DD string into "Mon, Sep 21" or "Sep 21" safely without UTC day shift.
 */
export const formatDateSafe = (dateString, options = { month: 'short', day: 'numeric' }) => {
  if (!dateString) return '';
  if (typeof dateString === 'string' && dateString.includes('T')) {
    dateString = dateString.split('T')[0];
  }
  const parts = String(dateString).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('en-US', options);
  }
  return formatDate(dateString);
};

/**
 * Formats backend week start and end (YYYY-MM-DD) into readable range:
 * e.g. "Mon, Sep 21 — Sun, Sep 27, 2026"
 */
export const formatWeekRange = (startStr, endStr) => {
  if (!startStr || !endStr) return '';
  const startFormatted = formatDateSafe(startStr, { weekday: 'short', month: 'short', day: 'numeric' });
  const endFormatted = formatDateSafe(endStr, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return `${startFormatted} — ${endFormatted}`;
};
