import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SensorReading } from '../../types';
import { Thermometer, Droplets, Wind, Sun, CloudRain } from 'lucide-react';
import { EmptyState } from '../Common/EmptyState';

interface EnvironmentChartProps {
  readings: SensorReading[];
  loading?: boolean;
}

type ChartMetric = 'temperature' | 'humidity' | 'gas' | 'light' | 'rainValue';

export const EnvironmentChart: React.FC<EnvironmentChartProps> = ({
  readings,
  loading = false,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('temperature');

  const metricConfig = {
    temperature: {
      name: 'Temperature',
      unit: '°C',
      color: '#F43F5E',
      icon: Thermometer,
      fillColor: 'rgba(244, 63, 94, 0.15)',
      domain: ['auto', 'auto'],
    },
    humidity: {
      name: 'Humidity',
      unit: '%',
      color: '#06B6D4',
      icon: Droplets,
      fillColor: 'rgba(6, 182, 212, 0.15)',
      domain: [0, 100],
    },
    gas: {
      name: 'Gas Level',
      unit: 'ppm',
      color: '#F59E0B',
      icon: Wind,
      fillColor: 'rgba(245, 158, 11, 0.15)',
      domain: ['auto', 'auto'],
    },
    light: {
      name: 'Light Level',
      unit: 'adc',
      color: '#EAB308',
      icon: Sun,
      fillColor: 'rgba(234, 179, 8, 0.15)',
      domain: ['auto', 'auto'],
    },
    rainValue: {
      name: 'Rain Sensor',
      unit: 'val',
      color: '#6366F1',
      icon: CloudRain,
      fillColor: 'rgba(99, 102, 241, 0.15)',
      domain: ['auto', 'auto'],
    },
  };

  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    // Filter readings that actually have values for this metric
    // If older records do not have rainValue, they will be handled without converting to zero
    return readings
      .filter((r) => {
        if (selectedMetric === 'rainValue') {
          return r.rainValue !== null && r.rainValue !== undefined;
        }
        return r[selectedMetric] !== null && r[selectedMetric] !== undefined;
      })
      .map((r) => {
        const val = r[selectedMetric];
        return {
          time: r.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          date: r.timestamp.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          }),
          fullTime: r.timestamp.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          value: typeof val === 'number' ? Number(val.toFixed(1)) : val,
          rawReading: r,
        };
      });
  }, [readings, selectedMetric]);

  const activeConfig = metricConfig[selectedMetric];

  return (
    <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 sm:p-6">
      {/* Header with Title & Metric Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Live Environment History</span>
          </h3>
          <p className="text-xs text-[#8B95A5] mt-0.5">
            Real-time telemetry recorded by ESP32 in Firebase Realtime Database
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/8 overflow-x-auto">
          {(Object.keys(metricConfig) as ChartMetric[]).map((key) => {
            const cfg = metricConfig[key];
            const Icon = cfg.icon;
            const isSelected = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#8B95A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      {loading ? (
        <div className="h-72 w-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={activeConfig.icon}
            title={`No ${activeConfig.name} history available yet`}
            description="Historical records will automatically plot here as ESP32 broadcasts updates to Firebase."
          />
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#8B95A5"
                tick={{ fontSize: 11, fill: '#8B95A5' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                minTickGap={25}
              />
              <YAxis
                stroke="#8B95A5"
                tick={{ fontSize: 11, fill: '#8B95A5' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                unit={` ${activeConfig.unit}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#151B23] border border-white/15 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                        <p className="text-[11px] text-[#8B95A5] mb-1 font-mono">{data.fullTime}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: activeConfig.color }}
                          />
                          <span className="text-xs text-[#8B95A5]">{activeConfig.name}:</span>
                          <span className="text-sm font-bold text-white font-mono">
                            {data.value} {activeConfig.unit}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={activeConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#gradient-${selectedMetric})`}
                dot={{ r: 3, fill: activeConfig.color }}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
