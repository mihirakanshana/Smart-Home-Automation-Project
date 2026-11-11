import { GasStatusLevel, LightStatusLevel, RainStatusLevel } from '../types';

/**
 * Smart Home Central Thresholds Configuration
 * All sensor status boundaries are defined here in one centralized location.
 */

export const TEMPERATURE_THRESHOLDS = {
  COLD_MAX: 18,
  OPTIMAL_MAX: 28,
  WARM_MAX: 35,
};

export const HUMIDITY_THRESHOLDS = {
  DRY_MAX: 30,
  OPTIMAL_MAX: 65,
};

/**
 * Determine temperature status level based on Celsius reading
 */
export function getTemperatureStatus(temp: number | null | undefined): {
  level: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  description: string;
} {
  if (temp === null || temp === undefined || isNaN(temp)) {
    return {
      level: 'No Data',
      variant: 'neutral',
      description: 'Thermal sensor offline',
    };
  }

  if (temp < TEMPERATURE_THRESHOLDS.COLD_MAX) {
    return {
      level: 'Cool',
      variant: 'info',
      description: 'Chilly indoor temperature',
    };
  } else if (temp <= TEMPERATURE_THRESHOLDS.OPTIMAL_MAX) {
    return {
      level: 'Normal',
      variant: 'success',
      description: 'Comfortable indoor temperature',
    };
  } else if (temp <= TEMPERATURE_THRESHOLDS.WARM_MAX) {
    return {
      level: 'Warm',
      variant: 'warning',
      description: 'Elevated thermal level',
    };
  } else {
    return {
      level: 'Hot',
      variant: 'danger',
      description: 'Excessive thermal heat detected',
    };
  }
}

/**
 * Determine humidity status level based on relative percentage
 */
export function getHumidityStatus(humidity: number | null | undefined): {
  level: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  description: string;
} {
  if (humidity === null || humidity === undefined || isNaN(humidity)) {
    return {
      level: 'No Data',
      variant: 'neutral',
      description: 'Moisture sensor offline',
    };
  }

  if (humidity < HUMIDITY_THRESHOLDS.DRY_MAX) {
    return {
      level: 'Dry',
      variant: 'warning',
      description: 'Low atmospheric moisture',
    };
  } else if (humidity <= HUMIDITY_THRESHOLDS.OPTIMAL_MAX) {
    return {
      level: 'Optimal',
      variant: 'success',
      description: 'Ideal indoor humidity range',
    };
  } else {
    return {
      level: 'Humid',
      variant: 'info',
      description: 'High moisture concentration',
    };
  }
}

// Gas Sensor Danger Threshold (MQ sensor analog ADC or ppm value)
export const GAS_DANGER_THRESHOLD = 4000;

export const GAS_THRESHOLDS = {
  DANGER: GAS_DANGER_THRESHOLD,
};

// Light Sensor Thresholds (LDR analog ADC or lux value)
export const LIGHT_THRESHOLDS = {
  DARK_MAX: 300,
  DIM_MAX: 700,
  // Values >= 700 are classified as Bright
};

// Rain Threshold (analog rain sensor reading, inverted or direct ADC)
// Clearly labeled: Project-configurable threshold, not scientifically calibrated
export const RAIN_THRESHOLDS = {
  // If sensor analog value is used when boolean is unavailable:
  // Typical rain board outputs lower resistance / higher conductivity or analog value when wet
  ANALOG_RAIN_TRIGGER: 500,
  IS_ANALOG_INVERTED: true, // Some sensors read low (0-500) when wet, high (1000+) when dry
};

/**
 * Determine gas status level based on numeric gas reading
 * Gas < 4000 -> SAFE (No gas leak alert)
 * Gas >= 4000 -> GAS LEAK DETECTED / DANGER (Show critical gas alert)
 */
export function getGasStatus(gas: number | null | undefined): {
  level: GasStatusLevel;
  badgeClass: string;
  color: string;
  description: string;
  isDanger: boolean;
} {
  if (gas === null || gas === undefined || isNaN(gas)) {
    return {
      level: 'Safe',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      color: '#10B981',
      description: 'No gas leak detected',
      isDanger: false,
    };
  }

  if (gas < GAS_DANGER_THRESHOLD) {
    return {
      level: 'Safe',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      color: '#10B981',
      description: 'No gas leak detected',
      isDanger: false,
    };
  } else {
    return {
      level: 'Danger',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold animate-pulse',
      color: '#EF4444',
      description: 'Immediate attention required',
      isDanger: true,
    };
  }
}

/**
 * Determine light status level based on numeric light reading
 */
export function getLightStatus(light: number | null | undefined): {
  level: LightStatusLevel;
  badgeClass: string;
  color: string;
  description: string;
} {
  if (light === null || light === undefined || isNaN(light)) {
    return {
      level: 'Dim',
      badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      color: '#94A3B8',
      description: 'Light sensor idle',
    };
  }

  if (light < LIGHT_THRESHOLDS.DARK_MAX) {
    return {
      level: 'Dark',
      badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      color: '#6366F1',
      description: 'Night / Low ambient light',
    };
  } else if (light <= LIGHT_THRESHOLDS.DIM_MAX) {
    return {
      level: 'Dim',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      color: '#F59E0B',
      description: 'Moderate ambient illumination',
    };
  } else {
    return {
      level: 'Bright',
      badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      color: '#EAB308',
      description: 'Well-lit / Daylight environment',
    };
  }
}

/**
 * Determine rain status from boolean flag (primary) or rainValue threshold fallback
 */
export function getRainStatus(
  rain: boolean | null | undefined,
  rainValue: number | null | undefined
): {
  level: RainStatusLevel;
  badgeClass: string;
  color: string;
  description: string;
  isRaining: boolean;
} {
  // 1. Primary source: boolean flag
  if (typeof rain === 'boolean') {
    if (rain) {
      return {
        level: 'Rain Detected',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        color: '#06B6D4',
        description: 'Precipitation actively detected by sensor',
        isRaining: true,
      };
    } else {
      return {
        level: 'No Rain',
        badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        color: '#64748B',
        description: 'Dry conditions detected',
        isRaining: false,
      };
    }
  }

  // 2. Secondary source: rainValue threshold if rain boolean is missing
  if (typeof rainValue === 'number' && !isNaN(rainValue)) {
    // If rainValue is a percentage or direct ADC reading
    const isTriggered = RAIN_THRESHOLDS.IS_ANALOG_INVERTED
      ? rainValue <= RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER && rainValue > 0
      : rainValue >= RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER;

    if (isTriggered) {
      return {
        level: 'Rain Detected',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        color: '#06B6D4',
        description: 'Rain threshold exceeded (analog estimate)',
        isRaining: true,
      };
    } else {
      return {
        level: 'No Rain',
        badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        color: '#64748B',
        description: 'Dry conditions detected (analog estimate)',
        isRaining: false,
      };
    }
  }

  return {
    level: 'No Data',
    badgeClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    color: '#475569',
    description: 'Rain sensor reading unavailable',
    isRaining: false,
  };
}
