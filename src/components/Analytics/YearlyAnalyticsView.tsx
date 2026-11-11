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
import { calculateYearlyAnalytics, calculateSummaryStatistics } from '../../utils/analytics';
import { Calendar, BarChart2 } from 'lucide-react';
import { EmptyState } from '../Common/EmptyState';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';

interface YearlyAnalyticsViewProps {
  readings: SensorReading[];
}

export const YearlyAnalyticsView: React.FC<YearlyAnalyticsViewProps> = ({ readings }) => {
  const currentYear = new Date().getFullYear();

  // Find latest year in readings
  const latestYear = useMemo(() => {
    if (readings.length > 0) {
      const sorted = [...readings].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return sorted[0].timestamp.getFullYear();
    }
    return currentYear;
  }, [readings, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(latestYear);

  // Auto-sync when data arrives
  useEffect(() => {
    if (readings.length > 0) {
      const hasYear = readings.some((r) => r.timestamp.getFullYear() === selectedYear);
      if (!hasYear) {
        setSelectedYear(latestYear);
      }
    }
  }, [readings, latestYear, selectedYear]);

  // Available years from readings
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    readings.forEach((r) => years.add(r.timestamp.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [readings, currentYear]);

  // Readings filtered for selected year
  const yearReadings = useMemo(() => {
    return readings.filter((r) => r.timestamp.getFullYear() === selectedYear);
  }, [readings, selectedYear]);

  const yearlyPoints = useMemo(() => {
    return calculateYearlyAnalytics(yearReadings, selectedYear);
  }, [yearReadings, selectedYear]);

  // Real summary stats for selected year
  const yearSummary = useMemo(() => {
    return calculateSummaryStatistics(yearReadings);
  }, [yearReadings]);

  const hasRainData = useMemo(() => {
    return yearlyPoints.some((p) => p.avgRainValue !== undefined);
  }, [yearlyPoints]);

  return (
    <div className="space-y-6">
      {/* Year Toolbar */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Select Analysis Year:</span>
        </div>

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

      {/* Year Summary Cards */}
      <AnalyticsSummaryCards summary={yearSummary} />

      {yearlyPoints.length < 2 ? (
        <EmptyState
          icon={BarChart2}
          title="Not enough historical data for yearly analytics yet."
          description="Yearly analytics will become available when more historical sensor data is collected."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Average Temperature */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Temperature by Month (°C)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Monthly mean temperature for {selectedYear} ({yearlyPoints.length} active months)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="monthName" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Average Humidity */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Humidity by Month (%)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Monthly mean moisture percentage for {selectedYear} ({yearlyPoints.length} active months)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="monthName" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Average Gas */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Gas Concentration by Month (ppm)</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Air quality monthly trends for {selectedYear} ({yearlyPoints.length} active months)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gasGradientYearly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="monthName" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    fill="url(#gasGradientYearly)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Average Light */}
          <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-1">Average Light Level by Month</h4>
            <p className="text-xs text-[#8B95A5] mb-4">
              Ambient illumination levels across {selectedYear} ({yearlyPoints.length} active months)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="monthName" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Average Rain (if present) */}
          {hasRainData && (
            <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 lg:col-span-2">
              <h4 className="text-sm font-bold text-white mb-1">Average Rain Sensor Value by Month</h4>
              <p className="text-xs text-[#8B95A5] mb-4">
                Monthly mean rain sensor reading across {selectedYear}
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGradientYearly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="monthName" stroke="#8B95A5" tick={{ fontSize: 10 }} />
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
                      fill="url(#rainGradientYearly)"
                      dot={{ r: 4 }}
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
