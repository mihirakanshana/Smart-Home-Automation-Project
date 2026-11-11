export interface CurrentSensors {
  temperature: number | null;
  humidity: number | null;
  gas: number | null;
  light: number | null;
  motion: boolean | null;
  fire: boolean | null;
  rain: boolean | null;
  rainValue: number | null;
  raw?: Record<string, unknown>;
  lastUpdated?: Date;
}

export interface DeviceState {
  light: boolean;
  door: boolean;
  alarm: boolean;
  fan: boolean;
}

export interface SystemStatus {
  wifiConnected: boolean;
  firebaseConnected: boolean;
  lastUpdate: Date | string | number | null;
  systemOnline: boolean;
  ipAddress?: string;
  uptimeSeconds?: number;
  firmwareVersion?: string;
}

export interface SensorReading {
  id: string;
  timestamp: Date;
  rawTimestamp: unknown;
  temperature?: number | null;
  humidity?: number | null;
  gas?: number | null;
  light?: number | null;
  motion?: boolean | null;
  fire?: boolean | null;
  rain?: boolean | null;
  rainValue?: number | null;
}

export interface VoiceCommandRecord {
  id: string;
  command: string;
  action: string;
  status: 'Executed' | 'Failed' | 'Pending' | 'Blocked';
  createdAt: Date;
  rawTimestamp?: unknown;
}

export interface NotificationItem {
  id: string;
  type: 'fire' | 'gas' | 'rain' | 'motion' | 'rfid' | 'device' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface RFIDRecord {
  id: string;
  cardUid: string;
  userName?: string;
  accessGranted: boolean;
  timestamp: Date;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export type GasStatusLevel = 'Safe' | 'Warning' | 'Danger';
export type LightStatusLevel = 'Dark' | 'Dim' | 'Bright';
export type RainStatusLevel = 'Rain Detected' | 'No Rain' | 'No Data';

export type ActiveTab = 'dashboard' | 'analytics' | 'devices' | 'security' | 'alerts' | 'voice' | 'settings';
