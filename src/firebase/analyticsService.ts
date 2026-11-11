import {
  ref as rtdbRef,
  query as rtdbQuery,
  limitToLast as rtdbLimitToLast,
  onValue as rtdbOnValue,
  off as rtdbOff,
  get as rtdbGet,
  DataSnapshot,
} from 'firebase/database';
import { database } from './config';
import { SensorReading } from '../types';
import { normalizeSensorReading } from '../utils/analytics';
import {
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
} from '../utils/timestamps';

export interface SensorHistoryQueryOptions {
  startDate?: Date;
  endDate?: Date;
  limitCount?: number;
}

/**
 * Normalizes an array of records and removes duplicates by ID or timestamp+temperature
 * and sorts them chronologically (oldest to newest).
 */
export function deduplicateAndSortReadings(readings: SensorReading[]): SensorReading[] {
  const seenIds = new Set<string>();
  const unique: SensorReading[] = [];

  for (const r of readings) {
    if (!r || !r.timestamp || isNaN(r.timestamp.getTime())) continue;
    const key = r.id || `${r.timestamp.getTime()}_${r.temperature}_${r.humidity}`;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      unique.push(r);
    }
  }

  // Sort chronologically ascending (oldest to newest)
  unique.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return unique;
}

/**
 * Filter readings in memory by date range
 */
export function filterReadingsInMemory(
  readings: SensorReading[],
  startDate?: Date,
  endDate?: Date
): SensorReading[] {
  if (!startDate && !endDate) return readings;

  const startMs = startDate ? startDate.getTime() : -Infinity;
  const endMs = endDate ? endDate.getTime() : Infinity;

  return readings.filter((r) => {
    const ms = r.timestamp.getTime();
    return ms >= startMs && ms <= endMs;
  });
}

/**
 * Real-Time Subscription to Firebase Realtime Database `sensor_readings`
 * 
 * - Reads all existing historical records immediately on snapshot
 * - Listens for live ESP32 new records in real time
 * - Safely converts RTDB push IDs and children to SensorReading[]
 * - Properly cleans up listener on unmount
 */
export function subscribeToSensorReadings(
  options: SensorHistoryQueryOptions = {},
  onData: (readings: SensorReading[]) => void,
  onError?: (err: Error) => void
): () => void {
  let isUnsubscribed = false;
  const historyRef = rtdbRef(database, 'sensor_readings');

  try {
    const rQuery = options.limitCount
      ? rtdbQuery(historyRef, rtdbLimitToLast(options.limitCount))
      : historyRef;

    const rtdbUnsub = rtdbOnValue(
      rQuery,
      (snapshot: DataSnapshot) => {
        if (isUnsubscribed) return;

        try {
          if (!snapshot.exists()) {
            onData([]);
            return;
          }

          const val = snapshot.val();
          if (!val || typeof val !== 'object') {
            onData([]);
            return;
          }

          const items: SensorReading[] = [];
          const entries = Object.entries(val as Record<string, unknown>);

          for (const [key, itemData] of entries) {
            const reading = normalizeSensorReading(key, itemData);
            if (reading) {
              items.push(reading);
            }
          }

          // Filter by date range if provided
          const filtered = filterReadingsInMemory(items, options.startDate, options.endDate);
          const sorted = deduplicateAndSortReadings(filtered);

          onData(sorted);
        } catch (err) {
          console.warn('[Analytics Service] RTDB data parsing error:', (err as Error).message);
          if (onError) onError(err as Error);
        }
      },
      (err) => {
        console.warn('[Analytics Service] RTDB subscription error:', err.message);
        if (onError) onError(new Error('Unable to load sensor history. Please check your connection.'));
      }
    );

    return () => {
      isUnsubscribed = true;
      rtdbOff(historyRef);
      if (typeof rtdbUnsub === 'function') {
        rtdbUnsub();
      }
    };
  } catch (err) {
    console.warn('[Analytics Service] RTDB listener initialization error:', (err as Error).message);
    if (onError) onError(err as Error);
    return () => {
      isUnsubscribed = true;
      rtdbOff(historyRef);
    };
  }
}

/**
 * Subscribe to Daily Sensor Readings for a specific Date from RTDB
 */
export function subscribeDailySensorReadings(
  date: Date,
  onData: (readings: SensorReading[]) => void,
  onError?: (err: Error) => void
): () => void {
  const startDate = getStartOfDay(date);
  const endDate = getEndOfDay(date);
  return subscribeToSensorReadings({ startDate, endDate }, onData, onError);
}

/**
 * Subscribe to Monthly Sensor Readings for a specific Year and Month (0-indexed) from RTDB
 */
export function subscribeMonthlySensorReadings(
  year: number,
  month: number,
  onData: (readings: SensorReading[]) => void,
  onError?: (err: Error) => void
): () => void {
  const startDate = getStartOfMonth(year, month);
  const endDate = getEndOfMonth(year, month);
  return subscribeToSensorReadings({ startDate, endDate }, onData, onError);
}

/**
 * Subscribe to Yearly Sensor Readings for a specific Year from RTDB
 */
export function subscribeYearlySensorReadings(
  year: number,
  onData: (readings: SensorReading[]) => void,
  onError?: (err: Error) => void
): () => void {
  const startDate = getStartOfYear(year);
  const endDate = getEndOfYear(year);
  return subscribeToSensorReadings({ startDate, endDate }, onData, onError);
}

/**
 * Subscribe to All Sensor Readings (with optional limit) from RTDB
 */
export function subscribeAllSensorReadings(
  onData: (readings: SensorReading[]) => void,
  onError?: (err: Error) => void,
  limitCount?: number
): () => void {
  return subscribeToSensorReadings({ limitCount }, onData, onError);
}

/**
 * Async fetch for Date Range from RTDB `sensor_readings`
 */
export async function getSensorReadingsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<SensorReading[]> {
  const results: SensorReading[] = [];

  try {
    const historyRef = rtdbRef(database, 'sensor_readings');
    const snapshot = await rtdbGet(historyRef);

    if (snapshot.exists()) {
      const val = snapshot.val();
      if (val && typeof val === 'object') {
        for (const [key, itemData] of Object.entries(val as Record<string, unknown>)) {
          const reading = normalizeSensorReading(key, itemData);
          if (reading) results.push(reading);
        }
      }
    }
  } catch (err) {
    console.warn('[Analytics Service] RTDB fetch error:', (err as Error).message);
  }

  const filtered = filterReadingsInMemory(results, startDate, endDate);
  return deduplicateAndSortReadings(filtered);
}

/**
 * Async fetch for Daily Readings
 */
export async function getDailySensorReadings(date: Date): Promise<SensorReading[]> {
  return getSensorReadingsByDateRange(getStartOfDay(date), getEndOfDay(date));
}

/**
 * Async fetch for Monthly Readings
 */
export async function getMonthlySensorReadings(year: number, month: number): Promise<SensorReading[]> {
  return getSensorReadingsByDateRange(getStartOfMonth(year, month), getEndOfMonth(year, month));
}

/**
 * Async fetch for Yearly Readings
 */
export async function getYearlySensorReadings(year: number): Promise<SensorReading[]> {
  return getSensorReadingsByDateRange(getStartOfYear(year), getEndOfYear(year));
}
