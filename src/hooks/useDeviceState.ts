import { useState, useEffect, useCallback } from 'react';
import { DeviceState } from '../types';
import { subscribeDeviceState, updateFanState } from '../firebase/database';

export function useDeviceState() {
  const [devices, setDevices] = useState<DeviceState>({
    light: false,
    door: false,
    alarm: false,
    fan: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingDevice, setPendingDevice] = useState<keyof DeviceState | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    device: keyof DeviceState;
    message: string;
    type: 'success' | 'error';
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeDeviceState((data) => {
      setDevices(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleFan = useCallback(
    async (explicitValue?: boolean) => {
      if (pendingDevice === 'fan') return;

      const nextVal = explicitValue !== undefined ? explicitValue : !devices.fan;
      setPendingDevice('fan');

      try {
        await updateFanState(nextVal);
        setActionFeedback({
          device: 'fan',
          message: 'Fan command sent',
          type: 'success',
          timestamp: Date.now(),
        });
      } catch {
        setActionFeedback({
          device: 'fan',
          message: 'Unable to control the fan. Please check your connection.',
          type: 'error',
          timestamp: Date.now(),
        });
      } finally {
        setPendingDevice(null);
      }
    },
    [devices.fan, pendingDevice]
  );

  const toggleDevice = useCallback(
    async (device: keyof DeviceState, explicitValue?: boolean) => {
      if (device !== 'fan') {
        return;
      }
      await toggleFan(explicitValue);
    },
    [toggleFan]
  );

  return {
    devices,
    loading,
    pendingDevice,
    actionFeedback,
    toggleDevice,
    toggleFan,
    clearFeedback: () => setActionFeedback(null),
  };
}
