import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CurrentSensors, SensorReading } from '../../types';
import { RainAnalytics } from '../../utils/analytics';
import { getRainStatus, RAIN_THRESHOLDS } from '../../utils/thresholds';
import { formatRainValue } from '../../utils/validation';
import { CloudRain, Droplets, Calendar, BarChart2, Info } from 'lucide-react';
import { StatusBadge } from '../Common/StatusBadge';
import { EmptyState } from '../Common/EmptyState';

interface RainAnalyticsViewProps {
  sensors: CurrentSensors;
  readings: SensorReading[];
  rainAnalytics: RainAnalytics;
}

export const RainAnalyticsView: React.FC<RainAnalyticsViewProps> = ({
  sensors,
  readings,
  rainAnalytics,
}) => {
  const rainStatus = getRainStatus(sensors.rain, sensors.rainValue);

  // Filter historical records that contain rain data
  const rainChartData = useMemo(() => {
    const records = readings.filter(
      (r) => r.rainValue !== null && r.rainValue !== undefined
    );

    return records.map((r) => ({
      time: r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: r.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      fullTime: r.timestamp.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      rainValue: r.rainValue,
      isRaining: r.rain === true ? 1 : 0,
    }));
  }, [readings]);

  return (
    <div className="space-y-6">
      {/* Real-time Status Card & Config Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <StatusBadge
              label={rainStatus.level}
              variant={rainStatus.level === 'Rain Detected' ? 'info' : 'neutral'}
              pulse={rainStatus.level === 'Rain Detected'}
            />
          </div>
          <p className="text-xs text-[#8B95A5] uppercase font-medium tracking-wider">
            Current Rain Status
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {rainStatus.level}
          </p>
          <p className="text-xs text-[#8B95A5] mt-2">{rainStatus.description}</p>
        </div>

        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-[#8B95A5]">Live ADC</span>
          </div>
          <p className="text-xs text-[#8B95A5] uppercase font-medium tracking-wider">
            Current Rain Value
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {formatRainValue(sensors.rainValue)}
          </p>
          <p className="text-xs text-[#8B95A5] mt-2">
            Analog rain sensor reading streaming from ESP32
          </p>
        </div>

        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Info className="w-4 h-4" />
            <span className="text-xs font-semibold">Sensor Calibration</span>
          </div>
          <p className="text-xs text-[#8B95A5] leading-relaxed">
            Rain Trigger Threshold:{' '}
            <strong className="text-white font-mono">{RAIN_THRESHOLDS.ANALOG_RAIN_TRIGGER}</strong>
          </p>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-[#8B95A5] mt-2">
            * Note: Threshold is project-configurable in <code className="text-indigo-300">thresholds.ts</code> and represents analog sensor resistance (not scientifically calibrated meteorological rainfall volume).
          </div>
        </div>
      </div>

      {/* Rain Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
          <p className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider">
            Rain Events
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {rainAnalytics.rainEvents}
          </p>
          <p className="text-[10px] text-[#8B95A5] mt-1">Triggers recorded in database</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
          <p className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider">
            Rainy Days
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {rainAnalytics.rainyDays}
          </p>
          <p className="text-[10px] text-[#8B95A5] mt-1">Unique days with rain recorded</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
          <p className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider">
            Average Rain Value
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {rainAnalytics.avgRainValue !== null ? rainAnalytics.avgRainValue : '--'}
          </p>
          <p className="text-[10px] text-[#8B95A5] mt-1">Mean historical analog reading</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
          <p className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider">
            Peak Rain Value
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {rainAnalytics.maxRainValue !== null ? rainAnalytics.maxRainValue : '--'}
          </p>
          <p className="text-[10px] text-[#8B95A5] mt-1">Maximum reading recorded</p>
        </div>
      </div>

      {/* Historical Rain Trend Chart */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 sm:p-6">
        <h4 className="text-base font-bold text-white mb-1">
          Historical Rain Value Trend
        </h4>
        <p className="text-xs text-[#8B95A5] mb-6">
          Chronological plot of actual Firebase historical sensor records containing rain telemetry
        </p>

        {rainChartData.length === 0 ? (
          <EmptyState
            icon={CloudRain}
            title="No rain history available yet"
            description="Older records in your database did not include the rain sensor. When new readings containing rain are logged by your ESP32, they will automatically populate here."
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#8B95A5" tick={{ fontSize: 10 }} minTickGap={25} />
                <YAxis stroke="#8B95A5" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#151B23] border border-white/15 p-3 rounded-xl shadow-2xl">
                          <p className="text-[11px] text-[#8B95A5] mb-1 font-mono">{data.fullTime}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                            <span className="text-xs text-[#8B95A5]">Rain Sensor Value:</span>
                            <span className="text-sm font-bold text-white font-mono">{data.rainValue}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rainValue"
                  name="Rain Value"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fill="url(#rainGradient)"
                  dot={{ r: 3.5, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
