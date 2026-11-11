import { useState, useEffect } from 'react';
import { SystemStatus } from '../types';
import { subscribeSystemStatus, subscribeFirebaseConnection } from '../firebase/database';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    wifiConnected: false,
    firebaseConnected: false,
    lastUpdate: null,
    systemOnline: false,
  });
  const [firebaseOnline, setFirebaseOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Subscribe to ESP32 system status
    const unsubSystem = subscribeSystemStatus((data) => {
      setStatus(data);
      setLoading(false);
    });

    // 2. Subscribe to Firebase client network state
    const unsubConn = subscribeFirebaseConnection((connected) => {
      setFirebaseOnline(connected);
    });

    return () => {
      unsubSystem();
      unsubConn();
    };
  }, []);

  return {
    status,
    firebaseOnline,
    loading,
    isFullyOnline: firebaseOnline && status.systemOnline,
    isReconnecting: !firebaseOnline,
  };
}
