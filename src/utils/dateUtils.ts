/**
 * Date and Time utilities for East Africa Time (EAT, UTC+3)
 * Timezone: Africa/Nairobi
 * Used by SportyBet and East African football broadcasts.
 */

export const APP_TIMEZONE = 'Africa/Nairobi';
export const APP_TIMEZONE_LABEL = 'EAT'; // East Africa Time (UTC+3)

/**
 * Returns today's calendar date in East Africa Time (EAT) as 'YYYY-MM-DD'
 */
export function getLocalTodayDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: APP_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Converts any ISO date string or timestamp into East Africa Time (EAT) 24-hr kickoff time: "HH:MM"
 */
export function formatToEatKickoffTime(dateInput?: string | Date | number): string {
  if (!dateInput) return '18:00';
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '18:00';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: APP_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return '18:00';
  }
}

/**
 * Converts any ISO date string or timestamp into East Africa Time (EAT) date: "YYYY-MM-DD"
 */
export function formatToEatDate(dateInput?: string | Date | number): string {
  if (!dateInput) return getLocalTodayDateString();
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return getLocalTodayDateString();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: APP_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return getLocalTodayDateString();
  }
}

/**
 * Calculates an offset date relative to a base date in EAT
 */
export function getOffsetDateString(offsetDays: number, baseDateIso?: string): string {
  let d: Date;
  if (baseDateIso) {
    const parts = baseDateIso.split('-');
    d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    d = new Date();
  }
  d.setDate(d.getDate() + offsetDays);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns human-readable label: "Today", "Yesterday", "Tomorrow", or formatted date
 */
export function formatDateLabel(isoString: string): string {
  const today = getLocalTodayDateString();
  const yesterday = getOffsetDateString(-1, today);
  const tomorrow = getOffsetDateString(1, today);

  if (isoString === today) return 'Today';
  if (isoString === yesterday) return 'Yesterday';
  if (isoString === tomorrow) return 'Tomorrow';

  try {
    const parts = isoString.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: APP_TIMEZONE });
  } catch {
    return isoString;
  }
}
