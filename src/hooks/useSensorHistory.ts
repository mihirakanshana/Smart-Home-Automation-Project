import { useState, useEffect, useMemo, useCallback } from 'react';
import { SensorReading } from '../types';
import { subscribeToSensorReadings } from '../firebase/analyticsService';
import {
  calculateSummaryStatistics,
  calculateRainAnalytics,
  SummaryStatistics,
  RainAnalytics,
} from '../utils/analytics';

export function useSensorHistory(limitCount?: number) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToSensorReadings(
      { limitCount },
      (data) => {
        setReadings(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('[useSensorHistory] RTDB error:', err.message);
        setError('Unable to load sensor history. Please check your connection.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [limitCount, retryTrigger]);

  // Memoize summary statistics from real historical data
  const summary: SummaryStatistics = useMemo(() => {
    return calculateSummaryStatistics(readings);
  }, [readings]);

  // Memoize rain analytics
  const rainAnalytics: RainAnalytics = useMemo(() => {
    return calculateRainAnalytics(readings);
  }, [readings]);

  return {
    readings,
    loading,
    error,
    summary,
    rainAnalytics,
    hasReadings: readings.length > 0,
    retry,
  };
}
