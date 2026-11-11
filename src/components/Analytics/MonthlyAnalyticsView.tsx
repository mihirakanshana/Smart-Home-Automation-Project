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
import { calculateMonthlyAnalytics, calculateSummaryStatistics } from '../../utils/analytics';
import { Calendar, BarChart2 } from 'lucide-react';
import { EmptyState } from '../Common/EmptyState';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';

interface MonthlyAnalyticsViewProps {
  readings: SensorReading[];
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MonthlyAnalyticsView: React.FC<MonthlyAnalyticsViewProps> = ({ readings }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Find the latest year and month in readings
  const latestDateInfo = useMemo(() => {
    if (readings.length > 0) {
      const sorted = [...readings].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return {
        year: sorted[0].timestamp.getFullYear(),
        month: sorted[0].timestamp.getMonth(),
      };
    }
    return { year: currentYear, month: currentMonth };
  }, [readings, currentYear, currentMonth]);

  const [selectedYear, setSelectedYear] = useState<number>(latestDateInfo.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(latestDateInfo.month);

  // Auto-sync when data arrives
  useEffect(() => {
    if (readings.length > 0) {
      const hasSelected = readings.some(
        (r) => r.timestamp.getFullYear() === selectedYear && r.timestamp.getMonth() === selectedMonth
      );
      if (!hasSelected) {
        setSelectedYear(latestDateInfo.year);
        setSelectedMonth(latestDateInfo.month);
      }
    }
  }, [readings, latestDateInfo, selectedYear, selectedMonth]);

  // Available years from readings
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    readings.forEach((r) => years.add(r.timestamp.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [readings, currentYear]);

  // Readings filtered for selected month & year
  const monthReadings = useMemo(() => {
    return readings.filter(
      (r) => r.timestamp.getFullYear() === selectedYear && r.timestamp.getMonth() === selectedMonth
    );
  }, [readings, selectedYear, selectedMonth]);

  const monthlyPoints = useMemo(() => {
    return calculateMonthlyAnalytics(monthReadings, selectedYear, selectedMonth);
  }, [monthReadings, selectedYear, selectedMonth]);

  // Real summary stats for selected month
  const monthSummary = useMemo(() => {
    return calculateSummaryStatistics(monthReadings);
  }, [monthReadings]);

  const hasRainData = useMemo(() => {
    return monthlyPoints.some((p) => p.avgRainValue !== undefined);
  }, [monthlyPoints]);

  return (
    <div className="space-y-6">
      {/* Month & Year Toolbar */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Select Month & Year:</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx} className="bg-[#151B23] text-white">
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {availableYears.map((y) => (
              <option key={y} value={y} className="bg-[#151B23] text-white">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Summary Cards */}
      <AnalyticsSummaryCards summary={monthSummary} />

      {monthlyPoints.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No sensor data recorded for this month"
          description={`There are no historical sensor readings in ${MONTHS[selectedMonth]} ${selectedYear}. Try selecting another month or year.`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Temperature by Day */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Temperature by Day (°C)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Daily mean temperature for {MONTHS[selectedMonth]} {selectedYear} ({monthlyPoints.length} active days)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dataKey="avgTemperature"
                    name="Avg Temp (°C)"
                    stroke="#F43F5E"
                    strokeWidth={2}
                    dot={{ r: 3.5 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Humidity by Day */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Humidity by Day (%)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Daily mean moisture percentage across the selected month ({monthlyPoints.length} active days)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dataKey="avgHumidity"
                    name="Avg Humidity (%)"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    dot={{ r: 3.5 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Gas by Day */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Gas Concentration by Day (ppm)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Daily mean atmospheric gas detection ({monthlyPoints.length} active days)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gasGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dataKey="avgGas"
                    name="Avg Gas (ppm)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#gasGradientMonthly)"
                    dot={{ r: 3.5 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Light by Day */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Light Level by Day</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Daily mean ambient light intensity ({monthlyPoints.length} active days)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dataKey="avgLight"
                    name="Avg Light Level"
                    stroke="#EAB308"
                    strokeWidth={2}
                    dot={{ r: 3.5 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Rain by Day (if present) */}
          {hasRainData && (
            <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 lg:col-span-2">
              <h4 className="text-sm font-bold text-white mb-1">Average Rain Sensor Value by Day</h4>
              <p className="text-xs text-[#8B95A5] mb-4">
                Daily mean rain intensity for {MONTHS[selectedMonth]} {selectedYear}
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGradientMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="dateStr" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                      dataKey="avgRainValue"
                      name="Rain Sensor Value"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fill="url(#rainGradientMonthly)"
                      dot={{ r: 3.5 }}
                      activeDot={{ r: 6 }}
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
