import { useState, useEffect, useRef } from 'react';
import { CurrentSensors, SystemStatus, NotificationItem } from '../types';
import { getGasStatus, GAS_DANGER_THRESHOLD } from '../utils/thresholds';

export function useNotifications(sensors: CurrentSensors, systemStatus: SystemStatus) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const prevFireRef = useRef<boolean | null>(null);
  const prevGasDangerRef = useRef<boolean>(false);
  const prevRainRef = useRef<boolean | null>(null);
  const prevMotionRef = useRef<boolean | null>(null);
  const prevSystemOnlineRef = useRef<boolean | null>(null);

  // Monitor real-time state changes and generate actionable notifications
  useEffect(() => {
    const newItems: NotificationItem[] = [];

    // Fire Alert
    if (sensors.fire === true && prevFireRef.current !== true) {
      newItems.push({
        id: `fire-${Date.now()}`,
        type: 'fire',
        severity: 'critical',
        title: 'Fire Detected!',
        message: 'Smoke/Flame sensor triggered. Immediate attention required!',
        timestamp: new Date(),
        read: false,
      });
    }
    prevFireRef.current = sensors.fire;

    // Gas Alert: triggers ONLY when transitioning from below 4000 to 4000 or above
    const gasStatus = getGasStatus(sensors.gas);
    const isGasDanger = gasStatus.level === 'Danger';
    if (isGasDanger && !prevGasDangerRef.current) {
      newItems.push({
        id: `gas-${Date.now()}`,
        type: 'gas',
        severity: 'critical',
        title: 'GAS LEAK DETECTED',
        message: `Gas concentration reached DANGER level (${Math.round(sensors.gas || 0)} ppm >= ${GAS_DANGER_THRESHOLD} ppm). Immediate attention required!`,
        timestamp: new Date(),
        read: false,
      });
    }
    prevGasDangerRef.current = isGasDanger;

    // Rain Alert
    if (sensors.rain === true && prevRainRef.current !== true) {
      newItems.push({
        id: `rain-${Date.now()}`,
        type: 'rain',
        severity: 'info',
        title: 'Rain Detected',
        message: 'Precipitation detected by outdoor weather sensor.',
        timestamp: new Date(),
        read: false,
      });
    }
    prevRainRef.current = sensors.rain;

    // Motion Alert
    if (sensors.motion === true && prevMotionRef.current !== true) {
      newItems.push({
        id: `motion-${Date.now()}`,
        type: 'motion',
        severity: 'info',
        title: 'PIR Motion Detected',
        message: 'Movement detected in monitored home zone.',
        timestamp: new Date(),
        read: false,
      });
    }
    prevMotionRef.current = sensors.motion;

    // System Online/Offline Alert
    if (prevSystemOnlineRef.current !== null && systemStatus.systemOnline !== prevSystemOnlineRef.current) {
      newItems.push({
        id: `system-${Date.now()}`,
        type: 'system',
        severity: systemStatus.systemOnline ? 'info' : 'warning',
        title: systemStatus.systemOnline ? 'ESP32 Connected' : 'ESP32 Offline',
        message: systemStatus.systemOnline
          ? 'ESP32 controller is actively communicating with Firebase RTDB.'
          : 'ESP32 controller has disconnected or is unreachable.',
        timestamp: new Date(),
        read: false,
      });
    }
    prevSystemOnlineRef.current = systemStatus.systemOnline;

    if (newItems.length > 0) {
      setNotifications((prev) => [...newItems, ...prev].slice(0, 30));
    }
  }, [sensors.fire, sensors.gas, sensors.rain, sensors.motion, systemStatus.systemOnline]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotification,
    clearAll,
  };
}
