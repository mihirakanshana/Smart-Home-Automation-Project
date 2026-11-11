import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SensorReading } from '../../types';
import { calculateDailyAnalytics, calculateSummaryStatistics } from '../../utils/analytics';
import { toInputDateFormat } from '../../utils/timestamps';
import { Calendar, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { EmptyState } from '../Common/EmptyState';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';

interface DailyAnalyticsViewProps {
  readings: SensorReading[];
}

export const DailyAnalyticsView: React.FC<DailyAnalyticsViewProps> = ({ readings }) => {
  // Extract all unique dates from existing readings (sorted newest to oldest)
  const availableDates = useMemo(() => {
    const datesMap = new Map<string, { date: Date; dateStr: string; count: number }>();
    for (const r of readings) {
      const dateStr = toInputDateFormat(r.timestamp);
      if (!datesMap.has(dateStr)) {
        datesMap.set(dateStr, {
          date: r.timestamp,
          dateStr,
          count: 1,
        });
      } else {
        datesMap.get(dateStr)!.count += 1;
      }
    }
    return Array.from(datesMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [readings]);

  // Default to today or the latest available reading date
  const latestDateStr = useMemo(() => {
    if (availableDates.length > 0) {
      return availableDates[0].dateStr;
    }
    return toInputDateFormat(new Date());
  }, [availableDates]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(latestDateStr);

  // Auto-sync to latest date if selected date has 0 readings and readings are available
  useEffect(() => {
    if (availableDates.length > 0) {
      const exists = availableDates.some((d) => d.dateStr === selectedDateStr);
      if (!exists) {
        setSelectedDateStr(availableDates[0].dateStr);
      }
    }
  }, [availableDates, selectedDateStr]);

  const selectedDate = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date();
  }, [selectedDateStr]);

  // Filter actual readings for selected date
  const dayReadings = useMemo(() => {
    return readings.filter((r) => {
      const y = r.timestamp.getFullYear();
      const m = r.timestamp.getMonth();
      const d = r.timestamp.getDate();
      return (
        y === selectedDate.getFullYear() &&
        m === selectedDate.getMonth() &&
        d === selectedDate.getDate()
      );
    });
  }, [readings, selectedDate]);

  const dailyPoints = useMemo(() => {
    return calculateDailyAnalytics(dayReadings, selectedDate);
  }, [dayReadings, selectedDate]);

  // Real summary statistics for selected date
  const dailySummary = useMemo(() => {
    return calculateSummaryStatistics(dayReadings);
  }, [dayReadings]);

  const hasRainData = useMemo(() => {
    return dailyPoints.some((p) => p.rainValue !== undefined || p.rain !== undefined);
  }, [dailyPoints]);

  const changeDateByDays = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDateStr(toInputDateFormat(next));
  };

  return (
    <div className="space-y-6">
      {/* Date Picker Toolbar */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Analysis Date:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          />

          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDateStr(toInputDateFormat(new Date()))}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Available Data Dates Quick Chips */}
      {availableDates.length > 0 && (
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-3.5 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#8B95A5] shrink-0 font-medium text-[11px]">Recorded History Dates:</span>
          {availableDates.slice(0, 10).map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-[#8B95A5] hover:text-white'
                }`}
              >
                {item.dateStr}
                <span className="text-[10px] opacity-75">({item.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Date Summary Cards */}
      <AnalyticsSummaryCards summary={dailySummary} />

      {dailyPoints.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No sensor data available for this date"
          description={`No recorded sensor readings exist for ${selectedDate.toLocaleDateString([], {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}. Select another date with historical readings from above.`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Day Chart */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Temperature Timeline (°C)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Real chronological readings for {selectedDate.toLocaleDateString()} ({dailyPoints.length} records)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#8B95A5" tick={{ fontSize: 10 }} minTickGap={20} />
                  <YAxis stroke="#8B95A5" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151B23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temp (°C)"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity Day Chart */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Relative Humidity Timeline (%)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Atmospheric moisture percentage across the selected date ({dailyPoints.length} records)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#8B95A5" tick={{ fontSize: 10 }} minTickGap={20} />
                  <YAxis stroke="#8B95A5" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151B23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity (%)"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gas Level Chart */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Gas Concentration (ppm)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Air quality and gas sensor data points ({dailyPoints.length} records)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gasGradientDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#8B95A5" tick={{ fontSize: 10 }} minTickGap={20} />
                  <YAxis stroke="#8B95A5" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151B23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="gas"
                    name="Gas (ppm)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#gasGradientDaily)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Light Level Chart */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Ambient Light Level</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Optical intensity telemetry across daylight and night ({dailyPoints.length} records)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="#8B95A5" tick={{ fontSize: 10 }} minTickGap={20} />
                  <YAxis stroke="#8B95A5" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151B23',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="light"
                    name="Light Level"
                    stroke="#EAB308"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rain Sensor Readings (if available) */}
          {hasRainData && (
            <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 lg:col-span-2">
              <h4 className="text-sm font-bold text-white mb-1">Rain Sensor Value (24h)</h4>
              <p className="text-xs text-[#8B95A5] mb-4">
                Analog rain sensor stream for the selected calendar day
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGradientDaily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#8B95A5" tick={{ fontSize: 10 }} minTickGap={20} />
                    <YAxis stroke="#8B95A5" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151B23',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="rainValue"
                      name="Rain Sensor Value"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fill="url(#rainGradientDaily)"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
