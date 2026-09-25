/**
 * Domain-neutral date and calendar boundary utilities.
 * Handles user-timezone resolution, DST-safe calendar math, and canonical date classifications.
 */

export const DEFAULT_NEAR_TERM_DAYS = 7;
export const DEFAULT_RETENTION_DAYS = 7;

/**
 * Resolves a timezone identifier safely, falling back to browser timezone or UTC.
 */
export function resolveTimezone(tz) {
  if (tz && typeof tz === 'string') {
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: tz });
      return tz;
    } catch {
      // Invalid timezone string, fall back to browser default
    }
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Formats a Date/timestamp into a user-local ISO date string `YYYY-MM-DD` in the resolved timezone.
 */
export function getCalendarDateString(dateInput, timeZone) {
  if (!dateInput) return null;
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;

  const tz = resolveTimezone(timeZone);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
}

/**
 * Performs calendar day addition/subtraction on `YYYY-MM-DD` strings without assuming fixed 24-hour days (DST safe).
 */
export function addCalendarDays(calendarDateStr, days) {
  if (!calendarDateStr || typeof calendarDateStr !== 'string') return null;
  const [yearStr, monthStr, dayStr] = calendarDateStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

  const utcDate = new Date(Date.UTC(y, m - 1, d + days));
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Classifies a due date into canonical time buckets:
 * - 'overdue'
 * - 'due_today'
 * - 'due_soon'
 * - 'later'
 * - 'no_due_date'
 */
export function classifyDueDate(
  dueDateInput,
  { now = new Date(), timeZone, nearTermDays = DEFAULT_NEAR_TERM_DAYS } = {}
) {
  if (!dueDateInput) return 'no_due_date';

  const tz = resolveTimezone(timeZone);

  // If dueDateInput is already a pure calendar date string 'YYYY-MM-DD'
  let dueCalStr = null;
  if (typeof dueDateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDateInput.trim())) {
    dueCalStr = dueDateInput.trim();
  } else {
    dueCalStr = getCalendarDateString(dueDateInput, tz);
  }

  if (!dueCalStr) return 'no_due_date';

  const todayCalStr = getCalendarDateString(now, tz);
  if (!todayCalStr) return 'no_due_date';

  if (dueCalStr < todayCalStr) return 'overdue';
  if (dueCalStr === todayCalStr) return 'due_today';

  const nearTermLimit = addCalendarDays(todayCalStr, nearTermDays);
  if (dueCalStr <= nearTermLimit) return 'due_soon';

  return 'later';
}

/**
 * Reusable DataGrid Due-Date Grouping Resolver.
 * Maps canonical classifications to DataGrid group metadata (domain-neutral).
 */
export function getDueDateGroup(
  dueDateInput,
  { now = new Date(), timeZone, nearTermDays = DEFAULT_NEAR_TERM_DAYS } = {}
) {
  const classification = classifyDueDate(dueDateInput, { now, timeZone, nearTermDays });

  switch (classification) {
    case 'overdue':
      return { id: 'overdue', label: 'Overdue' };
    case 'due_today':
      return { id: 'due_today', label: 'Due Today' };
    case 'due_soon':
      return { id: 'this_week', label: 'This Week' };
    case 'later':
      return { id: 'later', label: 'Later' };
    case 'no_due_date':
    default:
      return { id: 'no_due_date', label: 'No Due Date' };
  }
}
