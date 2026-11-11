import {
  ref,
  onValue,
  off,
  update,
  push,
  set,
  query,
  limitToLast,
  serverTimestamp,
  DatabaseReference,
  DataSnapshot,
} from 'firebase/database';
import { database } from './config';
import {
  CurrentSensors,
  DeviceState,
  SystemStatus,
  SensorReading,
  VoiceCommandRecord,
  RFIDRecord,
} from '../types';
import { parseFiniteNumber, parseBoolean } from '../utils/validation';
import { normalizeTimestamp } from '../utils/timestamps';
import { normalizeSensorReading } from '../utils/analytics';
import {
  subscribeToSensorReadings,
  getSensorReadingsByDateRange,
  getDailySensorReadings,
  getMonthlySensorReadings,
  getYearlySensorReadings,
  subscribeDailySensorReadings,
  subscribeMonthlySensorReadings,
  subscribeYearlySensorReadings,
} from './analyticsService';

export {
  subscribeToSensorReadings,
  getSensorReadingsByDateRange,
  getDailySensorReadings,
  getMonthlySensorReadings,
  getYearlySensorReadings,
  subscribeDailySensorReadings,
  subscribeMonthlySensorReadings,
  subscribeYearlySensorReadings,
};

/**
 * Subscribe to Real-Time Current Sensor Data at `Sensors/CurrentData`
 */
export function subscribeCurrentSensors(
  onData: (sensors: CurrentSensors) => void,
  onError?: (err: Error) => void
): () => void {
  const currentRef: DatabaseReference = ref(database, 'Sensors/CurrentData');

  const unsubscribe = onValue(
    currentRef,
    (snapshot: DataSnapshot) => {
      try {
        const val = snapshot.val();
        if (!val || typeof val !== 'object') {
          onData({
            temperature: null,
            humidity: null,
            gas: null,
            light: null,
            motion: null,
            fire: null,
            rain: null,
            rainValue: null,
            lastUpdated: new Date(),
          });
          return;
        }

        const data = val as Record<string, unknown>;
        const sensors: CurrentSensors = {
          temperature: parseFiniteNumber(data.temperature ?? data.temp),
          humidity: parseFiniteNumber(data.humidity ?? data.hum),
          gas: parseFiniteNumber(data.gas),
          light: parseFiniteNumber(data.light ?? data.ldr),
          motion: parseBoolean(data.motion),
          fire: parseBoolean(data.fire),
          rain: parseBoolean(data.rain),
          rainValue: parseFiniteNumber(data.rainValue ?? data.rain_val),
          raw: data,
          lastUpdated: new Date(),
        };

        onData(sensors);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    off(currentRef);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Subscribe to Real-Time Device States at `Devices/CurrentState`
 */
export function subscribeDeviceState(
  onData: (devices: DeviceState) => void,
  onError?: (err: Error) => void
): () => void {
  const devicesRef: DatabaseReference = ref(database, 'Devices/CurrentState');

  const unsubscribe = onValue(
    devicesRef,
    (snapshot: DataSnapshot) => {
      try {
        const val = snapshot.val();
        if (!val || typeof val !== 'object') {
          onData({
            light: false,
            door: false,
            alarm: false,
            fan: false,
          });
          return;
        }

        const data = val as Record<string, unknown>;
        const devices: DeviceState = {
          light: parseBoolean(data.light) ?? false,
          door: parseBoolean(data.door) ?? false,
          alarm: parseBoolean(data.alarm) ?? false,
          fan: parseBoolean(data.fan) ?? false,
        };

        onData(devices);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    off(devicesRef);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Update Fan State in Firebase Realtime Database at `Devices/CurrentState/fan`
 * (Fan is the only device that can be modified by the web application)
 */
export async function updateFanState(value: boolean): Promise<void> {
  const fanRef = ref(database, 'Devices/CurrentState/fan');
  await set(fanRef, value);
}

/**
 * Update device state - only Fan is permitted to be modified
 */
export async function updateDeviceState(
  device: keyof DeviceState,
  value: boolean
): Promise<void> {
  if (device !== 'fan') {
    console.warn(`Device '${device}' is read-only. Only the Fan can be controlled from the web app.`);
    return;
  }
  await updateFanState(value);
}

/**
 * Subscribe to System Status at `System/Status`
 */
export function subscribeSystemStatus(
  onData: (status: SystemStatus) => void,
  onError?: (err: Error) => void
): () => void {
  const systemRef: DatabaseReference = ref(database, 'System/Status');

  const unsubscribe = onValue(
    systemRef,
    (snapshot: DataSnapshot) => {
      try {
        const val = snapshot.val();
        if (!val || typeof val !== 'object') {
          onData({
            wifiConnected: false,
            firebaseConnected: false,
            lastUpdate: null,
            systemOnline: false,
          });
          return;
        }

        const data = val as Record<string, unknown>;
        const status: SystemStatus = {
          wifiConnected: parseBoolean(data.wifiConnected ?? data.wifi) ?? false,
          firebaseConnected: parseBoolean(data.firebaseConnected ?? data.firebase) ?? false,
          lastUpdate: normalizeTimestamp(data.lastUpdate ?? data.last_update ?? data.timestamp),
          systemOnline: parseBoolean(data.systemOnline ?? data.online) ?? false,
          ipAddress: typeof data.ipAddress === 'string' ? data.ipAddress : undefined,
          uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : undefined,
          firmwareVersion: typeof data.firmwareVersion === 'string' ? data.firmwareVersion : undefined,
        };

        onData(status);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    off(systemRef);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Subscribe to Historical Sensor Readings at `sensor_readings` (Unified Firestore & RTDB)
 */
export function subscribeSensorHistory(
  onData: (readings: SensorReading[]) => void,
  onError?: (err: Error) => void,
  limitCount?: number
): () => void {
  return subscribeToSensorReadings({ limitCount }, onData, onError);
}

/**
 * Subscribe to Voice Command History at `VoiceCommands`
 */
export function subscribeVoiceCommands(
  onData: (commands: VoiceCommandRecord[]) => void,
  onError?: (err: Error) => void,
  limitCount: number = 50
): () => void {
  const voiceRef = ref(database, 'VoiceCommands');
  const voiceQuery = query(voiceRef, limitToLast(limitCount));

  const unsubscribe = onValue(
    voiceQuery,
    (snapshot: DataSnapshot) => {
      try {
        const val = snapshot.val();
        if (!val || typeof val !== 'object') {
          onData([]);
          return;
        }

        const commands: VoiceCommandRecord[] = [];
        const entries = Object.entries(val as Record<string, unknown>);

        for (const [key, itemData] of entries) {
          if (itemData && typeof itemData === 'object') {
            const d = itemData as Record<string, unknown>;
            const created = normalizeTimestamp(d.createdAt ?? d.timestamp ?? d.time) || new Date();
            commands.push({
              id: key,
              command: String(d.command || 'Voice action'),
              action: String(d.action || 'unknown'),
              status: (d.status === 'Executed' || d.status === 'Failed' || d.status === 'Pending' || d.status === 'Blocked') ? d.status : 'Executed',
              createdAt: created,
              rawTimestamp: d.createdAt,
            });
          }
        }

        // Sort descending (newest first)
        commands.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        onData(commands);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    off(voiceRef);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Record a new Voice Command to `VoiceCommands` in Firebase
 */
export async function logVoiceCommand(
  command: string,
  action: string,
  status: 'Executed' | 'Failed' | 'Pending' | 'Blocked' = 'Executed'
): Promise<void> {
  const voiceListRef = ref(database, 'VoiceCommands');
  const newCmdRef = push(voiceListRef);
  await set(newCmdRef, {
    command,
    action,
    status,
    createdAt: Date.now(),
    timestamp: serverTimestamp(),
  });
}

/**
 * Listen to Firebase client connection status (`.info/connected`)
 */
export function subscribeFirebaseConnection(
  onStatus: (connected: boolean) => void
): () => void {
  const connectedRef = ref(database, '.info/connected');
  const unsubscribe = onValue(connectedRef, (snap) => {
    onStatus(!!snap.val());
  });

  return () => {
    off(connectedRef);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

/**
 * Subscribe to RFID Access Logs if available at `Security/RFID` or `RFID/History`
 */
export function subscribeRFIDHistory(
  onData: (records: RFIDRecord[]) => void
): () => void {
  const rfidRef = ref(database, 'Security/RFID');
  const unsubscribe = onValue(rfidRef, (snap) => {
    const val = snap.val();
    if (!val || typeof val !== 'object') {
      onData([]);
      return;
    }
    const records: RFIDRecord[] = [];
    for (const [key, itemData] of Object.entries(val as Record<string, unknown>)) {
      if (itemData && typeof itemData === 'object') {
        const d = itemData as Record<string, unknown>;
        records.push({
          id: key,
          cardUid: String(d.cardUid || d.uid || 'Unknown UID'),
          userName: typeof d.userName === 'string' ? d.userName : undefined,
          accessGranted: parseBoolean(d.accessGranted ?? d.granted) ?? true,
          timestamp: normalizeTimestamp(d.timestamp ?? d.time) || new Date(),
        });
      }
    }
    records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    onData(records);
  });

  return () => {
    off(rfidRef);
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}
