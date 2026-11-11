/**
 * Robust Timestamp Normalization and Formatting Utilities
 * Handles various timestamp formats produced by ESP32, Firebase ServerValue, Firestore Timestamp, and ISO dates.
 */

export function normalizeTimestamp(raw: unknown): Date | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  // If already a Date object
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }

  // If Firestore Timestamp object (has .toDate() or .toMillis() method)
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (typeof (obj as { toDate?: () => unknown }).toDate === 'function') {
      try {
        const d = (obj as { toDate: () => unknown }).toDate();
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      } catch {
        // continue
      }
    }
    if (typeof (obj as { toMillis?: () => unknown }).toMillis === 'function') {
      try {
        const ms = (obj as { toMillis: () => unknown }).toMillis();
        if (typeof ms === 'number' && isFinite(ms) && ms > 0) return new Date(ms);
      } catch {
        // continue
      }
    }
    if (typeof obj.seconds === 'number' && isFinite(obj.seconds) && obj.seconds > 0) {
      const nanos = typeof obj.nanoseconds === 'number' ? obj.nanoseconds : 0;
      return new Date(obj.seconds * 1000 + Math.floor(nanos / 1000000));
    }
    if (typeof obj._seconds === 'number' && isFinite(obj._seconds) && obj._seconds > 0) {
      const nanos = typeof obj._nanoseconds === 'number' ? obj._nanoseconds : 0;
      return new Date(obj._seconds * 1000 + Math.floor(nanos / 1000000));
    }
  }

  // If numeric (Unix milliseconds or Unix seconds)
  if (typeof raw === 'number') {
    if (isNaN(raw) || !isFinite(raw) || raw <= 0) return null;
    // If it's in seconds (e.g. 10-digit Unix timestamp like 1700000000)
    if (raw < 10000000000) {
      return new Date(raw * 1000);
    }
    // Milliseconds
    return new Date(raw);
  }

  // If string representation
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Check if string is purely numeric digits
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (isNaN(num) || num <= 0) return null;
      if (num < 10000000000) {
        return new Date(num * 1000);
      }
      return new Date(num);
    }

    // Try standard ISO / Date.parse
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  return null;
}

export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

export function getEndOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

export function getStartOfYear(year: number): Date {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

export function getEndOfYear(year: number): Date {
  return new Date(year, 11, 31, 23, 59, 59, 999);
}

export function formatTime(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatShortTime(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return 'No timestamp';
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function isSameYear(date: Date, year: number): boolean {
  return date.getFullYear() === year;
}

export function toInputDateFormat(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

