import { useState, useEffect } from 'react';
import { CurrentSensors } from '../types';
import { subscribeCurrentSensors } from '../firebase/database';

export function useCurrentSensors() {
  const [sensors, setSensors] = useState<CurrentSensors>({
    temperature: null,
    humidity: null,
    gas: null,
    light: null,
    motion: null,
    fire: null,
    rain: null,
    rainValue: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeCurrentSensors(
      (data) => {
        setSensors(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Error listening to current sensor data');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return { sensors, loading, error };
}
