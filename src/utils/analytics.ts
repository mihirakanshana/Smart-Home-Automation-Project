import { SensorReading } from '../types';
import { normalizeTimestamp, isSameDay, isSameMonth, isSameYear } from './timestamps';
import { parseFiniteNumber, parseBoolean } from './validation';
import { RAIN_THRESHOLDS } from './thresholds';

export interface DailyAnalyticsPoint {
  time: string;
  timestamp: number;
  temperature?: number;
  humidity?: number;
  gas?: number;
  light?: number;
  rainValue?: number;
  rain?: boolean;
}

export interface MonthlyAnalyticsPoint {
  day: number;
  dateStr: string;
  avgTemperature?: number;
  avgHumidity?: number;
  avgGas?: number;
  avgLight?: number;
  avgRainValue?: number;
  readingsCount: number;
}

export interface YearlyAnalyticsPoint {
  monthIndex: number;
  monthName: string;
  avgTemperature?: number;
  avgHumidity?: number;
  avgGas?: number;
  avgLight?: number;
  avgRainValue?: number;
  readingsCount: number;
}

export interface SummaryStatistics {
  avgTemperature: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  avgHumidity: number | null;
  maxHumidity: number | null;
  minHumidity: number | null;
  avgGas: number | null;
  maxGas: number | null;
  avgLight: number | null;
  maxLight: number | null;
  fireEvents: number;
  motionEvents: number;
  rainEvents: number;
  rainyDays: number;
  avgRainValue: number | null;
  maxRainValue: number | null;
  totalReadings: number;
}

export interface RainAnalytics {
  rainEvents: number;
  rainyDays: number;
  avgRainValue: number | null;
  maxRainValue: number | null;
  hasRainData: boolean;
  rainHistoryCount: number;
}

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Normalizes raw Firebase Realtime Database object from `sensor_readings` into a strongly-typed SensorReading
 * Handles flexible ESP32 naming conventions and safe type conversions.
 */
export function normalizeSensorReading(key: string, data: unknown): SensorReading | null {
  if (!data || typeof data !== 'object') return null;

  const raw = data as Record<string, unknown>;
  const ts = normalizeTimestamp(
    raw.timestamp ?? raw.time ?? raw.createdAt ?? raw.date ?? raw.lastUpdate ?? key
  );
  if (!ts) return null;

  // Rain: check boolean flags & numeric intensities across various possible ESP32 naming patterns
  const rawRainBool = parseBoolean(
    raw.rain ?? raw.rainDetected ?? raw.isRaining ?? raw.Rain ?? raw.rain_detected
  );
  const rawRainNum = parseFiniteNumber(
    raw.rainValue ??
      raw.rain_val ??
      raw.rainfall ??
      raw.rainIntensity ??
      raw.rain_intensity ??
      (typeof raw.rain === 'number' ? raw.rain : undefined)
  );

  const reading: SensorReading = {
    id: key,
    timestamp: ts,
    rawTimestamp: raw.timestamp ?? ts,
    temperature: parseFiniteNumber(raw.temperature ?? raw.temp ?? raw.Temperature ?? raw.TEMP),
    humidity: parseFiniteNumber(raw.humidity ?? raw.hum ?? raw.Humidity ?? raw.HUM),
    gas: parseFiniteNumber(raw.gas ?? raw.gasValue ?? raw.Gas ?? raw.GAS ?? raw.mq2 ?? raw.mq135 ?? raw.gas_value),
    light: parseFiniteNumber(raw.light ?? raw.ldr ?? raw.lightValue ?? raw.Light ?? raw.LIGHT ?? raw.lux ?? raw.light_value),
    motion: parseBoolean(raw.motion ?? raw.motionDetected ?? raw.pir ?? raw.Motion ?? raw.PIR ?? raw.motion_detected),
    fire: parseBoolean(raw.fire ?? raw.fireDetected ?? raw.flame ?? raw.Fire ?? raw.FLAME ?? raw.fire_detected),
    rain: rawRainBool !== null ? rawRainBool : (rawRainNum !== null && rawRainNum > 0 ? true : null),
    rainValue: rawRainNum,
  };

  return reading;
}

/**
 * Safe Math Averages (skips non-finite numbers)
 */
export function calculateAverage(values: number[]): number | null {
  const valid = values.filter((v) => typeof v === 'number' && isFinite(v));
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  return sum / valid.length;
}

/**
 * Safe Math Maximum (skips non-finite numbers)
 */
export function calculateMaximum(values: number[]): number | null {
  const valid = values.filter((v) => typeof v === 'number' && isFinite(v));
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

/**
 * Safe Math Minimum (skips non-finite numbers)
 */
export function calculateMinimum(values: number[]): number | null {
  const valid = values.filter((v) => typeof v === 'number' && isFinite(v));
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

/**
 * Count boolean events safely using transition detection (false -> true = 1 event)
 */
export function countBooleanEvents(readings: SensorReading[], key: 'fire' | 'motion' | 'rain'): number {
  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  let count = 0;
  let lastState = false;

  for (const r of sorted) {
    const currentState = r[key] === true;
    if (currentState && !lastState) {
      count++;
    }
    lastState = currentState;
  }

  return count;
}

/**
 * Filter readings by a specific calendar day
 */
export function filterReadingsByDate(readings: SensorReading[], targetDate: Date): SensorReading[] {
  return readings.filter((r) => isSameDay(r.timestamp, targetDate));
}

/**
 * Calculate Daily analytics data points (chronological by time)
 */
export function calculateDailyAnalytics(readings: SensorReading[], targetDate: Date): DailyAnalyticsPoint[] {
  const dayReadings = filterReadingsByDate(readings, targetDate);
  dayReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return dayReadings.map((r) => {
    const mins = r.timestamp.getMinutes();
    const secs = r.timestamp.getSeconds();
    const timeFormatted =
      mins === 0 && secs === 0
        ? r.timestamp.toLocaleTimeString([], { hour: 'numeric', hour12: true })
        : r.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const point: DailyAnalyticsPoint = {
      time: timeFormatted,
      timestamp: r.timestamp.getTime(),
    };

    if (r.temperature !== null && r.temperature !== undefined && isFinite(r.temperature)) {
      point.temperature = Number(r.temperature.toFixed(1));
    }
    if (r.humidity !== null && r.humidity !== undefined && isFinite(r.humidity)) {
      point.humidity = Number(r.humidity.toFixed(1));
    }
    if (r.gas !== null && r.gas !== undefined && isFinite(r.gas)) {
      point.gas = Math.round(r.gas);
    }
    if (r.light !== null && r.light !== undefined && isFinite(r.light)) {
      point.light = Math.round(r.light);
    }
    if (r.rainValue !== null && r.rainValue !== undefined && isFinite(r.rainValue)) {
      point.rainValue = Math.round(r.rainValue);
    }
    if (r.rain !== null && r.rain !== undefined) {
      point.rain = r.rain;
    }

    return point;
  });
}

/**
 * Reusable Day Aggregation utility for Monthly analytics
 */
export function aggregateByDay(
  readings: SensorReading[],
  year: number,
  monthIndex: number
): MonthlyAnalyticsPoint[] {
  const monthReadings = readings.filter((r) => isSameMonth(r.timestamp, year, monthIndex));
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const dayBuckets: { [day: number]: SensorReading[] } = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dayBuckets[d] = [];
  }

  for (const r of monthReadings) {
    const day = r.timestamp.getDate();
    if (dayBuckets[day]) {
      dayBuckets[day].push(r);
    }
  }

  const result: MonthlyAnalyticsPoint[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const list = dayBuckets[d];
    if (list.length === 0) continue; // Do NOT invent fake readings or fake zeroes for empty days

    const tempVals = list.map((r) => r.temperature).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const humVals = list.map((r) => r.humidity).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const gasVals = list.map((r) => r.gas).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const lightVals = list.map((r) => r.light).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const rainVals = list.map((r) => r.rainValue).filter((v): v is number => typeof v === 'number' && isFinite(v));

    const avgTemp = calculateAverage(tempVals);
    const avgHum = calculateAverage(humVals);
    const avgGas = calculateAverage(gasVals);
    const avgLight = calculateAverage(lightVals);
    const avgRain = calculateAverage(rainVals);

    const point: MonthlyAnalyticsPoint = {
      day: d,
      dateStr: `${MONTH_NAMES[monthIndex]} ${d}`,
      readingsCount: list.length,
    };

    if (avgTemp !== null) point.avgTemperature = Number(avgTemp.toFixed(1));
    if (avgHum !== null) point.avgHumidity = Number(avgHum.toFixed(1));
    if (avgGas !== null) point.avgGas = Math.round(avgGas);
    if (avgLight !== null) point.avgLight = Math.round(avgLight);
    if (avgRain !== null) point.avgRainValue = Math.round(avgRain);

    result.push(point);
  }

  return result;
}

/**
 * Calculate Monthly analytics data points grouped by day of month
 */
export function calculateMonthlyAnalytics(
  readings: SensorReading[],
  year: number,
  monthIndex: number
): MonthlyAnalyticsPoint[] {
  return aggregateByDay(readings, year, monthIndex);
}

/**
 * Reusable Month Aggregation utility for Yearly analytics
 */
export function aggregateByMonth(
  readings: SensorReading[],
  year: number
): YearlyAnalyticsPoint[] {
  const yearReadings = readings.filter((r) => isSameYear(r.timestamp, year));

  const monthBuckets: { [m: number]: SensorReading[] } = {};
  for (let m = 0; m < 12; m++) {
    monthBuckets[m] = [];
  }

  for (const r of yearReadings) {
    const m = r.timestamp.getMonth();
    if (monthBuckets[m]) {
      monthBuckets[m].push(r);
    }
  }

  const result: YearlyAnalyticsPoint[] = [];

  for (let m = 0; m < 12; m++) {
    const list = monthBuckets[m];
    if (list.length === 0) continue; // Only real data months

    const tempVals = list.map((r) => r.temperature).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const humVals = list.map((r) => r.humidity).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const gasVals = list.map((r) => r.gas).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const lightVals = list.map((r) => r.light).filter((v): v is number => typeof v === 'number' && isFinite(v));
    const rainVals = list.map((r) => r.rainValue).filter((v): v is number => typeof v === 'number' && isFinite(v));

    const avgTemp = calculateAverage(tempVals);
    const avgHum = calculateAverage(humVals);
    const avgGas = calculateAverage(gasVals);
    const avgLight = calculateAverage(lightVals);
    const avgRain = calculateAverage(rainVals);

    const point: YearlyAnalyticsPoint = {
      monthIndex: m,
      monthName: MONTH_NAMES[m],
      readingsCount: list.length,
    };

    if (avgTemp !== null) point.avgTemperature = Number(avgTemp.toFixed(1));
    if (avgHum !== null) point.avgHumidity = Number(avgHum.toFixed(1));
    if (avgGas !== null) point.avgGas = Math.round(avgGas);
    if (avgLight !== null) point.avgLight = Math.round(avgLight);
    if (avgRain !== null) point.avgRainValue = Math.round(avgRain);

    result.push(point);
  }

  return result;
}

/**
 * Calculate Yearly analytics grouped by month
 */
export function calculateYearlyAnalytics(
  readings: SensorReading[],
  year: number
): YearlyAnalyticsPoint[] {
  return aggregateByMonth(readings, year);
}

/**
 * Calculate Summary Statistics from historical readings with transition event counting
 */
export function calculateSummaryStatistics(readings: SensorReading[]): SummaryStatistics {
  if (!readings || readings.length === 0) {
    return {
      avgTemperature: null,
      maxTemperature: null,
      minTemperature: null,
      avgHumidity: null,
      maxHumidity: null,
      minHumidity: null,
      avgGas: null,
      maxGas: null,
      avgLight: null,
      maxLight: null,
      fireEvents: 0,
      motionEvents: 0,
      rainEvents: 0,
      rainyDays: 0,
      avgRainValue: null,
      maxRainValue: null,
      totalReadings: 0,
    };
  }

  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const tempVals = sorted.map((r) => r.temperature).filter((v): v is number => typeof v === 'number' && isFinite(v));
  const humVals = sorted.map((r) => r.humidity).filter((v): v is number => typeof v === 'number' && isFinite(v));
  const gasVals = sorted.map((r) => r.gas).filter((v): v is number => typeof v === 'number' && isFinite(v));
  const lightVals = sorted.map((r) => r.light).filter((v): v is number => typeof v === 'number' && isFinite(v));
  const rainVals = sorted.map((r) => r.rainValue).filter((v): v is number => typeof v === 'number' && isFinite(v));

  // Event transition counting (false -> true = 1 event)
  let fireEvents = 0;
  let lastFireState = false;

  let motionEvents = 0;
  let lastMotionState = false;

  let rainEvents = 0;
  let lastRainState = false;
  const rainyDayKeys = new Set<string>();

  for (const r of sorted) {
    const currentFire = r.fire === true;
    if (currentFire && !lastFireState) {
      fireEvents++;
    }
    lastFireState = currentFire;

    const currentMotion = r.motion === true;
    if (currentMotion && !lastMotionState) {
      motionEvents++;
    }
    lastMotionState = currentMotion;

    const isRaining =
      r.rain === true ||
      (r.rain === null &&
        typeof r.rainValue === 'number' &&
        (RAIN_THRESHOLDS.IS_ANALOG_INVERTED
          ? r.rainValue <= RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER && r.rainValue > 0
          : r.rainValue >= RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER));

    if (isRaining && !lastRainState) {
      rainEvents++;
    }
    lastRainState = isRaining;

    if (isRaining) {
      const dayKey = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}-${r.timestamp.getDate()}`;
      rainyDayKeys.add(dayKey);
    }
  }

  const avgTemp = calculateAverage(tempVals);
  const avgHum = calculateAverage(humVals);
  const avgGas = calculateAverage(gasVals);
  const avgLight = calculateAverage(lightVals);
  const avgRain = calculateAverage(rainVals);

  return {
    avgTemperature: avgTemp !== null ? Number(avgTemp.toFixed(1)) : null,
    maxTemperature: calculateMaximum(tempVals),
    minTemperature: calculateMinimum(tempVals),

    avgHumidity: avgHum !== null ? Number(avgHum.toFixed(1)) : null,
    maxHumidity: calculateMaximum(humVals),
    minHumidity: calculateMinimum(humVals),

    avgGas: avgGas !== null ? Math.round(avgGas) : null,
    maxGas: calculateMaximum(gasVals),

    avgLight: avgLight !== null ? Math.round(avgLight) : null,
    maxLight: calculateMaximum(lightVals),

    fireEvents,
    motionEvents,
    rainEvents,
    rainyDays: rainyDayKeys.size,
    avgRainValue: avgRain !== null ? Math.round(avgRain) : null,
    maxRainValue: calculateMaximum(rainVals),
    totalReadings: sorted.length,
  };
}

/**
 * Dedicated rain analytics calculations with event transition detection
 */
export function calculateRainAnalytics(readings: SensorReading[]): RainAnalytics {
  const recordsWithRain = readings.filter(
    (r) => (r.rain !== null && r.rain !== undefined) || (r.rainValue !== null && r.rainValue !== undefined)
  );

  if (recordsWithRain.length === 0) {
    return {
      rainEvents: 0,
      rainyDays: 0,
      avgRainValue: null,
      maxRainValue: null,
      hasRainData: false,
      rainHistoryCount: 0,
    };
  }

  const sorted = [...recordsWithRain].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const rainVals = sorted
    .map((r) => r.rainValue)
    .filter((v): v is number => typeof v === 'number' && isFinite(v));

  let rainEvents = 0;
  let lastRainState = false;
  const rainyDayKeys = new Set<string>();

  for (const r of sorted) {
    const isRaining =
      r.rain === true ||
      (r.rain === null &&
        typeof r.rainValue === 'number' &&
        (RAIN_THRESHOLDS.IS_ANALOG_INVERTED
          ? r.rainValue <= RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER && r.rainValue > 0
          : r.rainValue >= RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER));

    if (isRaining && !lastRainState) {
      rainEvents++;
    }
    lastRainState = isRaining;

    if (isRaining) {
      const dayKey = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth()}-${r.timestamp.getDate()}`;
      rainyDayKeys.add(dayKey);
    }
  }

  const avgRain = calculateAverage(rainVals);

  return {
    rainEvents,
    rainyDays: rainyDayKeys.size,
    avgRainValue: avgRain !== null ? Math.round(avgRain) : null,
    maxRainValue: calculateMaximum(rainVals),
    hasRainData: true,
    rainHistoryCount: sorted.length,
  };
}
