/**
 * Data Validation and Missing Value Helpers
 * Guarantees that undefined, null, NaN, and invalid dates are never displayed.
 */

export function parseFiniteNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isFinite(val) && !isNaN(val) ? val : null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return isFinite(num) && !isNaN(num) ? num : null;
  }
  return null;
}

export function parseBoolean(val: unknown): boolean | null {
  if (typeof val === 'boolean') return val;
  if (val === 1 || val === '1' || val === 'true' || val === 'TRUE' || val === 'on' || val === 'ON') {
    return true;
  }
  if (val === 0 || val === '0' || val === 'false' || val === 'FALSE' || val === 'off' || val === 'OFF') {
    return false;
  }
  return null;
}

export function formatTemperature(val: number | null | undefined): string {
  const num = parseFiniteNumber(val);
  return num !== null ? `${num.toFixed(1)} °C` : '-- °C';
}

export function formatHumidity(val: number | null | undefined): string {
  const num = parseFiniteNumber(val);
  return num !== null ? `${num.toFixed(1)} %` : '-- %';
}

export function formatGasValue(val: number | null | undefined): string {
  const num = parseFiniteNumber(val);
  return num !== null ? `${Math.round(num)}` : '--';
}

export function formatLightValue(val: number | null | undefined): string {
  const num = parseFiniteNumber(val);
  return num !== null ? `${Math.round(num)}` : '--';
}

export function formatRainValue(val: number | null | undefined): string {
  const num = parseFiniteNumber(val);
  return num !== null ? `${Math.round(num)}` : '--';
}
