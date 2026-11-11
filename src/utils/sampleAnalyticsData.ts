import { SensorReading } from '../types';
import { calculateSummaryStatistics, calculateRainAnalytics, SummaryStatistics, RainAnalytics } from './analytics';

/**
 * Flag to enable/disable temporary sample preview mode for Analytics charts.
 * When true -> Analytics displays high-quality local sample data.
 * When false -> Analytics seamlessly reverts to real Firebase RTDB data.
 */
export const ANALYTICS_PREVIEW_MODE = true;

/**
 * Hourly profile template data for 18 August 2026 through 24 August 2026.
 * All timestamps are in August 2026 (Month index 7 in JS Date: Jan=0, Feb=1, ..., Aug=7).
 */
interface HourlyDef {
  hour: number;
  temp: number;
  hum: number;
  gas: number;
  light: number;
  rainVal: number;
  rain: boolean;
  motion?: boolean;
  fire?: boolean;
}

// 18 Aug 2026: Warm sunny summer day
const DAY_18_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 25.4, hum: 84, gas: 280, light: 120, rainVal: 15, rain: false, motion: false },
  { hour: 1, temp: 25.1, hum: 85, gas: 270, light: 110, rainVal: 10, rain: false, motion: false },
  { hour: 2, temp: 24.8, hum: 86, gas: 260, light: 110, rainVal: 10, rain: false, motion: false },
  { hour: 3, temp: 24.5, hum: 87, gas: 250, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 4, temp: 24.2, hum: 88, gas: 240, light: 110, rainVal: 15, rain: false, motion: false },
  { hour: 5, temp: 24.6, hum: 87, gas: 260, light: 240, rainVal: 20, rain: false, motion: false },
  { hour: 6, temp: 25.3, hum: 84, gas: 310, light: 580, rainVal: 15, rain: false, motion: true },
  { hour: 7, temp: 26.2, hum: 79, gas: 480, light: 890, rainVal: 10, rain: false, motion: true },
  { hour: 8, temp: 27.1, hum: 74, gas: 620, light: 1240, rainVal: 10, rain: false, motion: true },
  { hour: 9, temp: 28.0, hum: 70, gas: 740, light: 1680, rainVal: 5, rain: false, motion: false },
  { hour: 10, temp: 28.9, hum: 66, gas: 890, light: 2150, rainVal: 5, rain: false, motion: false },
  { hour: 11, temp: 29.8, hum: 63, gas: 1120, light: 2540, rainVal: 0, rain: false, motion: true },
  { hour: 12, temp: 30.6, hum: 60, gas: 1450, light: 2820, rainVal: 0, rain: false, motion: true },
  { hour: 13, temp: 31.3, hum: 58, gas: 1380, light: 2920, rainVal: 0, rain: false, motion: true },
  { hour: 14, temp: 31.6, hum: 57, gas: 1190, light: 2850, rainVal: 0, rain: false, motion: false },
  { hour: 15, temp: 31.1, hum: 59, gas: 980, light: 2610, rainVal: 0, rain: false, motion: false },
  { hour: 16, temp: 30.2, hum: 62, gas: 820, light: 2180, rainVal: 5, rain: false, motion: false },
  { hour: 17, temp: 29.1, hum: 66, gas: 760, light: 1540, rainVal: 5, rain: false, motion: true },
  { hour: 18, temp: 28.2, hum: 70, gas: 950, light: 920, rainVal: 10, rain: false, motion: true },
  { hour: 19, temp: 27.4, hum: 73, gas: 1680, light: 450, rainVal: 15, rain: false, motion: true },
  { hour: 20, temp: 26.8, hum: 76, gas: 1420, light: 180, rainVal: 20, rain: false, motion: true },
  { hour: 21, temp: 26.3, hum: 79, gas: 890, light: 140, rainVal: 20, rain: false, motion: true },
  { hour: 22, temp: 25.9, hum: 81, gas: 520, light: 120, rainVal: 15, rain: false, motion: false },
  { hour: 23, temp: 25.5, hum: 83, gas: 360, light: 110, rainVal: 15, rain: false, motion: false },
];

// 19 Aug 2026: Afternoon rain shower
const DAY_19_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 25.2, hum: 84, gas: 310, light: 120, rainVal: 20, rain: false, motion: false },
  { hour: 1, temp: 24.9, hum: 85, gas: 290, light: 110, rainVal: 15, rain: false, motion: false },
  { hour: 2, temp: 24.6, hum: 86, gas: 280, light: 110, rainVal: 15, rain: false, motion: false },
  { hour: 3, temp: 24.4, hum: 87, gas: 270, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 4, temp: 24.2, hum: 88, gas: 260, light: 100, rainVal: 15, rain: false, motion: false },
  { hour: 5, temp: 24.5, hum: 87, gas: 280, light: 220, rainVal: 20, rain: false, motion: false },
  { hour: 6, temp: 25.1, hum: 84, gas: 340, light: 540, rainVal: 15, rain: false, motion: true },
  { hour: 7, temp: 25.9, hum: 80, gas: 490, light: 840, rainVal: 10, rain: false, motion: true },
  { hour: 8, temp: 26.8, hum: 75, gas: 650, light: 1180, rainVal: 10, rain: false, motion: true },
  { hour: 9, temp: 27.6, hum: 71, gas: 780, light: 1590, rainVal: 10, rain: false, motion: false },
  { hour: 10, temp: 28.3, hum: 68, gas: 910, light: 1980, rainVal: 15, rain: false, motion: false },
  { hour: 11, temp: 28.9, hum: 66, gas: 1140, light: 2320, rainVal: 20, rain: false, motion: true },
  { hour: 12, temp: 29.3, hum: 65, gas: 1320, light: 2450, rainVal: 35, rain: false, motion: true },
  { hour: 13, temp: 29.2, hum: 68, gas: 1220, light: 2100, rainVal: 80, rain: false, motion: true },
  { hour: 14, temp: 28.5, hum: 74, gas: 880, light: 1480, rainVal: 420, rain: false, motion: false },
  { hour: 15, temp: 26.4, hum: 89, gas: 620, light: 780, rainVal: 1450, rain: true, motion: false },
  { hour: 16, temp: 25.6, hum: 92, gas: 540, light: 650, rainVal: 980, rain: true, motion: false },
  { hour: 17, temp: 25.8, hum: 88, gas: 590, light: 890, rainVal: 310, rain: true, motion: true },
  { hour: 18, temp: 26.2, hum: 84, gas: 820, light: 680, rainVal: 90, rain: false, motion: true },
  { hour: 19, temp: 26.0, hum: 83, gas: 1540, light: 380, rainVal: 40, rain: false, motion: true },
  { hour: 20, temp: 25.7, hum: 84, gas: 1280, light: 160, rainVal: 30, rain: false, motion: true },
  { hour: 21, temp: 25.4, hum: 85, gas: 790, light: 130, rainVal: 25, rain: false, motion: true },
  { hour: 22, temp: 25.1, hum: 86, gas: 480, light: 120, rainVal: 20, rain: false, motion: false },
  { hour: 23, temp: 24.8, hum: 86, gas: 350, light: 110, rainVal: 20, rain: false, motion: false },
];

// 20 Aug 2026: Clear, pleasant day
const DAY_20_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 24.7, hum: 85, gas: 290, light: 110, rainVal: 15, rain: false, motion: false },
  { hour: 1, temp: 24.5, hum: 86, gas: 280, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 2, temp: 24.3, hum: 86, gas: 270, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 3, temp: 24.2, hum: 87, gas: 260, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 4, temp: 24.0, hum: 88, gas: 250, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 5, temp: 24.4, hum: 86, gas: 270, light: 250, rainVal: 15, rain: false, motion: false },
  { hour: 6, temp: 25.1, hum: 82, gas: 330, light: 610, rainVal: 10, rain: false, motion: true },
  { hour: 7, temp: 26.0, hum: 77, gas: 490, light: 940, rainVal: 10, rain: false, motion: true },
  { hour: 8, temp: 26.9, hum: 72, gas: 640, light: 1320, rainVal: 5, rain: false, motion: true },
  { hour: 9, temp: 27.8, hum: 68, gas: 760, light: 1750, rainVal: 5, rain: false, motion: false },
  { hour: 10, temp: 28.6, hum: 65, gas: 890, light: 2200, rainVal: 0, rain: false, motion: false },
  { hour: 11, temp: 29.4, hum: 62, gas: 1100, light: 2590, rainVal: 0, rain: false, motion: true },
  { hour: 12, temp: 30.1, hum: 60, gas: 1350, light: 2810, rainVal: 0, rain: false, motion: true },
  { hour: 13, temp: 30.6, hum: 59, gas: 1290, light: 2890, rainVal: 0, rain: false, motion: true },
  { hour: 14, temp: 30.8, hum: 58, gas: 1140, light: 2840, rainVal: 0, rain: false, motion: false },
  { hour: 15, temp: 30.4, hum: 60, gas: 950, light: 2580, rainVal: 0, rain: false, motion: false },
  { hour: 16, temp: 29.6, hum: 63, gas: 810, light: 2120, rainVal: 5, rain: false, motion: false },
  { hour: 17, temp: 28.5, hum: 67, gas: 750, light: 1490, rainVal: 5, rain: false, motion: true },
  { hour: 18, temp: 27.7, hum: 71, gas: 920, light: 880, rainVal: 10, rain: false, motion: true },
  { hour: 19, temp: 27.1, hum: 74, gas: 1720, light: 420, rainVal: 10, rain: false, motion: true },
  { hour: 20, temp: 26.5, hum: 77, gas: 1380, light: 170, rainVal: 15, rain: false, motion: true },
  { hour: 21, temp: 26.0, hum: 80, gas: 840, light: 140, rainVal: 15, rain: false, motion: true },
  { hour: 22, temp: 25.5, hum: 82, gas: 490, light: 120, rainVal: 15, rain: false, motion: false },
  { hour: 23, temp: 25.0, hum: 84, gas: 340, light: 110, rainVal: 10, rain: false, motion: false },
];

// 21 Aug 2026: Morning drizzle / overcast
const DAY_21_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 24.8, hum: 85, gas: 300, light: 110, rainVal: 20, rain: false, motion: false },
  { hour: 1, temp: 24.5, hum: 86, gas: 280, light: 100, rainVal: 25, rain: false, motion: false },
  { hour: 2, temp: 24.3, hum: 87, gas: 270, light: 100, rainVal: 30, rain: false, motion: false },
  { hour: 3, temp: 24.1, hum: 88, gas: 260, light: 100, rainVal: 45, rain: false, motion: false },
  { hour: 4, temp: 24.0, hum: 89, gas: 250, light: 110, rainVal: 70, rain: false, motion: false },
  { hour: 5, temp: 24.1, hum: 89, gas: 270, light: 190, rainVal: 150, rain: false, motion: false },
  { hour: 6, temp: 24.3, hum: 88, gas: 320, light: 360, rainVal: 280, rain: false, motion: true },
  { hour: 7, temp: 24.5, hum: 88, gas: 410, light: 420, rainVal: 380, rain: false, motion: true },
  { hour: 8, temp: 24.8, hum: 90, gas: 520, light: 580, rainVal: 760, rain: true, motion: true },
  { hour: 9, temp: 25.4, hum: 87, gas: 690, light: 890, rainVal: 510, rain: true, motion: false },
  { hour: 10, temp: 26.2, hum: 81, gas: 820, light: 1280, rainVal: 180, rain: false, motion: false },
  { hour: 11, temp: 27.1, hum: 75, gas: 980, light: 1650, rainVal: 60, rain: false, motion: true },
  { hour: 12, temp: 27.8, hum: 71, gas: 1180, light: 1940, rainVal: 30, rain: false, motion: true },
  { hour: 13, temp: 28.4, hum: 68, gas: 1140, light: 2080, rainVal: 15, rain: false, motion: true },
  { hour: 14, temp: 28.7, hum: 66, gas: 1020, light: 2150, rainVal: 10, rain: false, motion: false },
  { hour: 15, temp: 28.8, hum: 66, gas: 880, light: 2020, rainVal: 5, rain: false, motion: false },
  { hour: 16, temp: 28.2, hum: 69, gas: 790, light: 1740, rainVal: 10, rain: false, motion: false },
  { hour: 17, temp: 27.4, hum: 73, gas: 730, light: 1280, rainVal: 15, rain: false, motion: true },
  { hour: 18, temp: 26.8, hum: 76, gas: 890, light: 740, rainVal: 20, rain: false, motion: true },
  { hour: 19, temp: 26.5, hum: 78, gas: 1600, light: 390, rainVal: 25, rain: false, motion: true },
  { hour: 20, temp: 26.1, hum: 80, gas: 1240, light: 160, rainVal: 25, rain: false, motion: true },
  { hour: 21, temp: 25.8, hum: 82, gas: 780, light: 140, rainVal: 20, rain: false, motion: true },
  { hour: 22, temp: 25.4, hum: 84, gas: 460, light: 120, rainVal: 20, rain: false, motion: false },
  { hour: 23, temp: 25.0, hum: 85, gas: 330, light: 110, rainVal: 15, rain: false, motion: false },
];

// 22 Aug 2026: Hot sunny day
const DAY_22_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 25.5, hum: 82, gas: 320, light: 130, rainVal: 15, rain: false, motion: false },
  { hour: 1, temp: 25.3, hum: 83, gas: 300, light: 120, rainVal: 10, rain: false, motion: false },
  { hour: 2, temp: 25.1, hum: 83, gas: 290, light: 120, rainVal: 10, rain: false, motion: false },
  { hour: 3, temp: 24.9, hum: 84, gas: 280, light: 110, rainVal: 10, rain: false, motion: false },
  { hour: 4, temp: 24.8, hum: 85, gas: 270, light: 110, rainVal: 10, rain: false, motion: false },
  { hour: 5, temp: 25.1, hum: 82, gas: 290, light: 260, rainVal: 15, rain: false, motion: false },
  { hour: 6, temp: 25.8, hum: 78, gas: 360, light: 650, rainVal: 10, rain: false, motion: true },
  { hour: 7, temp: 26.8, hum: 73, gas: 520, light: 1020, rainVal: 10, rain: false, motion: true },
  { hour: 8, temp: 27.8, hum: 68, gas: 690, light: 1420, rainVal: 5, rain: false, motion: true },
  { hour: 9, temp: 28.7, hum: 63, gas: 830, light: 1880, rainVal: 5, rain: false, motion: false },
  { hour: 10, temp: 29.6, hum: 60, gas: 990, light: 2340, rainVal: 0, rain: false, motion: false },
  { hour: 11, temp: 30.5, hum: 58, gas: 1240, light: 2710, rainVal: 0, rain: false, motion: true },
  { hour: 12, temp: 31.2, hum: 56, gas: 1550, light: 2940, rainVal: 0, rain: false, motion: true },
  { hour: 13, temp: 31.7, hum: 55, gas: 1850, light: 2980, rainVal: 0, rain: false, motion: true },
  { hour: 14, temp: 31.9, hum: 55, gas: 1460, light: 2910, rainVal: 0, rain: false, motion: false },
  { hour: 15, temp: 31.4, hum: 57, gas: 1120, light: 2680, rainVal: 0, rain: false, motion: false },
  { hour: 16, temp: 30.6, hum: 60, gas: 920, light: 2240, rainVal: 5, rain: false, motion: false },
  { hour: 17, temp: 29.5, hum: 64, gas: 840, light: 1590, rainVal: 5, rain: false, motion: true },
  { hour: 18, temp: 28.6, hum: 68, gas: 1080, light: 980, rainVal: 10, rain: false, motion: true },
  { hour: 19, temp: 27.9, hum: 71, gas: 1940, light: 490, rainVal: 15, rain: false, motion: true },
  { hour: 20, temp: 27.3, hum: 74, gas: 2180, light: 190, rainVal: 15, rain: false, motion: true },
  { hour: 21, temp: 26.8, hum: 77, gas: 1120, light: 150, rainVal: 20, rain: false, motion: true },
  { hour: 22, temp: 26.4, hum: 79, gas: 620, light: 130, rainVal: 20, rain: false, motion: false },
  { hour: 23, temp: 26.0, hum: 81, gas: 410, light: 120, rainVal: 15, rain: false, motion: false },
];

// 23 Aug 2026: Hot afternoon, heavy evening thunderstorm
const DAY_23_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 25.8, hum: 83, gas: 340, light: 120, rainVal: 15, rain: false, motion: false },
  { hour: 1, temp: 25.5, hum: 84, gas: 320, light: 110, rainVal: 15, rain: false, motion: false },
  { hour: 2, temp: 25.3, hum: 85, gas: 310, light: 110, rainVal: 10, rain: false, motion: false },
  { hour: 3, temp: 25.1, hum: 85, gas: 300, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 4, temp: 25.0, hum: 85, gas: 290, light: 100, rainVal: 10, rain: false, motion: false },
  { hour: 5, temp: 25.3, hum: 83, gas: 310, light: 230, rainVal: 15, rain: false, motion: false },
  { hour: 6, temp: 25.9, hum: 80, gas: 380, light: 590, rainVal: 10, rain: false, motion: true },
  { hour: 7, temp: 26.7, hum: 76, gas: 540, light: 920, rainVal: 10, rain: false, motion: true },
  { hour: 8, temp: 27.6, hum: 72, gas: 710, light: 1340, rainVal: 10, rain: false, motion: true },
  { hour: 9, temp: 28.5, hum: 68, gas: 860, light: 1780, rainVal: 5, rain: false, motion: false },
  { hour: 10, temp: 29.4, hum: 65, gas: 1020, light: 2210, rainVal: 5, rain: false, motion: false },
  { hour: 11, temp: 30.2, hum: 63, gas: 1260, light: 2540, rainVal: 0, rain: false, motion: true },
  { hour: 12, temp: 30.8, hum: 62, gas: 1480, light: 2720, rainVal: 0, rain: false, motion: true },
  { hour: 13, temp: 31.1, hum: 61, gas: 1400, light: 2700, rainVal: 0, rain: false, motion: true },
  { hour: 14, temp: 31.2, hum: 62, gas: 1240, light: 2580, rainVal: 0, rain: false, motion: false },
  { hour: 15, temp: 30.7, hum: 64, gas: 1060, light: 2280, rainVal: 10, rain: false, motion: false },
  { hour: 16, temp: 29.8, hum: 68, gas: 890, light: 1750, rainVal: 35, rain: false, motion: false },
  { hour: 17, temp: 28.8, hum: 73, gas: 840, light: 1050, rainVal: 180, rain: false, motion: true },
  { hour: 18, temp: 27.4, hum: 78, gas: 940, light: 240, rainVal: 890, rain: true, motion: true },
  { hour: 19, temp: 25.2, hum: 93, gas: 1120, light: 140, rainVal: 2350, rain: true, motion: true },
  { hour: 20, temp: 24.6, hum: 91, gas: 1850, light: 110, rainVal: 1620, rain: true, motion: true },
  { hour: 21, temp: 24.4, hum: 88, gas: 2350, light: 110, rainVal: 480, rain: true, motion: true },
  { hour: 22, temp: 24.5, hum: 88, gas: 1200, light: 100, rainVal: 80, rain: false, motion: false },
  { hour: 23, temp: 24.3, hum: 87, gas: 620, light: 100, rainVal: 40, rain: false, motion: false },
];

// 24 Aug 2026: Fresh breeze, moderate afternoon passing rain
const DAY_24_HOURLY: HourlyDef[] = [
  { hour: 0, temp: 24.4, hum: 86, gas: 310, light: 110, rainVal: 25, rain: false, motion: false },
  { hour: 1, temp: 24.3, hum: 86, gas: 290, light: 100, rainVal: 20, rain: false, motion: false },
  { hour: 2, temp: 24.2, hum: 86, gas: 280, light: 100, rainVal: 15, rain: false, motion: false },
  { hour: 3, temp: 24.1, hum: 87, gas: 270, light: 100, rainVal: 15, rain: false, motion: false },
  { hour: 4, temp: 24.0, hum: 87, gas: 260, light: 100, rainVal: 15, rain: false, motion: false },
  { hour: 5, temp: 24.3, hum: 85, gas: 280, light: 240, rainVal: 20, rain: false, motion: false },
  { hour: 6, temp: 24.9, hum: 81, gas: 340, light: 580, rainVal: 15, rain: false, motion: true },
  { hour: 7, temp: 25.8, hum: 77, gas: 490, light: 910, rainVal: 10, rain: false, motion: true },
  { hour: 8, temp: 26.6, hum: 73, gas: 650, light: 1280, rainVal: 10, rain: false, motion: true },
  { hour: 9, temp: 27.5, hum: 69, gas: 790, light: 1690, rainVal: 10, rain: false, motion: false },
  { hour: 10, temp: 28.3, hum: 66, gas: 920, light: 2110, rainVal: 5, rain: false, motion: false },
  { hour: 11, temp: 29.0, hum: 64, gas: 1110, light: 2460, rainVal: 5, rain: false, motion: true },
  { hour: 12, temp: 29.6, hum: 63, gas: 1280, light: 2650, rainVal: 0, rain: false, motion: true },
  { hour: 13, temp: 29.8, hum: 64, gas: 1200, light: 2600, rainVal: 30, rain: false, motion: true },
  { hour: 14, temp: 29.1, hum: 68, gas: 990, light: 2100, rainVal: 380, rain: false, motion: false },
  { hour: 15, temp: 27.1, hum: 84, gas: 890, light: 1320, rainVal: 720, rain: true, motion: false },
  { hour: 16, temp: 27.8, hum: 79, gas: 810, light: 1850, rainVal: 140, rain: false, motion: false },
  { hour: 17, temp: 27.6, hum: 75, gas: 760, light: 1390, rainVal: 40, rain: false, motion: true },
  { hour: 18, temp: 27.2, hum: 75, gas: 920, light: 820, rainVal: 20, rain: false, motion: true },
  { hour: 19, temp: 26.8, hum: 76, gas: 1520, light: 420, rainVal: 15, rain: false, motion: true },
  { hour: 20, temp: 26.3, hum: 78, gas: 1290, light: 170, rainVal: 15, rain: false, motion: true },
  { hour: 21, temp: 25.9, hum: 80, gas: 810, light: 140, rainVal: 15, rain: false, motion: true },
  { hour: 22, temp: 25.5, hum: 82, gas: 480, light: 120, rainVal: 15, rain: false, motion: false },
  { hour: 23, temp: 25.2, hum: 83, gas: 350, light: 110, rainVal: 15, rain: false, motion: false },
];

const DAILY_SPECS: { day: number; data: HourlyDef[] }[] = [
  { day: 18, data: DAY_18_HOURLY },
  { day: 19, data: DAY_19_HOURLY },
  { day: 20, data: DAY_20_HOURLY },
  { day: 21, data: DAY_21_HOURLY },
  { day: 22, data: DAY_22_HOURLY },
  { day: 23, data: DAY_23_HOURLY },
  { day: 24, data: DAY_24_HOURLY },
];

/**
 * Generate the single unified dataset covering 18 August 2026 through 24 August 2026.
 * Total: 7 days * 24 hours = 168 readings.
 */
function generatePreviewReadings(): {
  readings: SensorReading[];
  summary: SummaryStatistics;
  rainAnalytics: RainAnalytics;
} {
  const readings: SensorReading[] = [];
  const year = 2026;
  const month = 7; // August (0-indexed)
  let id = 1;

  for (const spec of DAILY_SPECS) {
    for (const h of spec.data) {
      const timestamp = new Date(year, month, spec.day, h.hour, 0, 0);

      readings.push({
        id: `preview-reading-${id++}`,
        timestamp,
        rawTimestamp: timestamp.getTime(),
        temperature: h.temp,
        humidity: h.hum,
        gas: h.gas,
        light: h.light,
        motion: h.motion ?? false,
        fire: h.fire ?? false,
        rain: h.rain,
        rainValue: h.rainVal,
      });
    }
  }

  // Ensure chronological order
  readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Dynamically compute global summary and rain analytics from the generated readings
  const summary = calculateSummaryStatistics(readings);
  const rainAnalytics = calculateRainAnalytics(readings);

  return { readings, summary, rainAnalytics };
}

// Stable singleton instance initialized once to prevent re-randomization
export const SAMPLE_ANALYTICS_DATA = generatePreviewReadings();
