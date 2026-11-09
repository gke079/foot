/**
 * Date utilities for local date strings in YYYY-MM-DD format
 * ensuring exact alignment with the user's real-world local calendar day.
 */

export function getLocalTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

export function formatDateLabel(isoString: string): string {
  const today = getLocalTodayDateString();
  const yesterday = getOffsetDateString(-1);
  const tomorrow = getOffsetDateString(1);

  if (isoString === today) return 'Today';
  if (isoString === yesterday) return 'Yesterday';
  if (isoString === tomorrow) return 'Tomorrow';

  try {
    const parts = isoString.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}
