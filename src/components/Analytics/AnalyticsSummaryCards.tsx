import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Flame,
  Activity,
  CloudRain,
  Calendar,
} from 'lucide-react';
import { SummaryStatistics } from '../../utils/analytics';

interface AnalyticsSummaryCardsProps {
  summary: SummaryStatistics;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
  summary,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Temperature Range */}
      <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
        <div className="flex items-center gap-2 text-rose-400 mb-2">
          <Thermometer className="w-4 h-4" />
          <span className="text-xs font-semibold">Temperature</span>
        </div>
        <p className="text-xl font-bold text-white font-mono">
          {summary.avgTemperature !== null ? `${summary.avgTemperature} °C` : '--'}
        </p>
        <div className="text-[10px] text-[#8B95A5] mt-1 flex items-center justify-between">
          <span>Min: {summary.minTemperature !== null ? `${summary.minTemperature}°` : '--'}</span>
          <span>Max: {summary.maxTemperature !== null ? `${summary.maxTemperature}°` : '--'}</span>
        </div>
      </div>

      {/* Humidity Range */}
      <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <Droplets className="w-4 h-4" />
          <span className="text-xs font-semibold">Humidity</span>
        </div>
        <p className="text-xl font-bold text-white font-mono">
          {summary.avgHumidity !== null ? `${summary.avgHumidity} %` : '--'}
        </p>
        <div className="text-[10px] text-[#8B95A5] mt-1 flex items-center justify-between">
          <span>Min: {summary.minHumidity !== null ? `${summary.minHumidity}%` : '--'}</span>
          <span>Max: {summary.maxHumidity !== null ? `${summary.maxHumidity}%` : '--'}</span>
        </div>
      </div>

      {/* Gas Average & Peak */}
      <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Wind className="w-4 h-4" />
          <span className="text-xs font-semibold">Gas Quality</span>
        </div>
        <p className="text-xl font-bold text-white font-mono">
          {summary.avgGas !== null ? `${summary.avgGas} ppm` : '--'}
        </p>
        <div className="text-[10px] text-[#8B95A5] mt-1 flex items-center justify-between">
          <span>Avg: {summary.avgGas !== null ? summary.avgGas : '--'}</span>
          <span>Peak: {summary.maxGas !== null ? summary.maxGas : '--'}</span>
        </div>
      </div>

      {/* Light Average & Peak */}
      <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
        <div className="flex items-center gap-2 text-yellow-400 mb-2">
          <Sun className="w-4 h-4" />
          <span className="text-xs font-semibold">Light Level</span>
        </div>
        <p className="text-xl font-bold text-white font-mono">
          {summary.avgLight !== null ? `${summary.avgLight}` : '--'}
        </p>
        <div className="text-[10px] text-[#8B95A5] mt-1 flex items-center justify-between">
          <span>Avg: {summary.avgLight !== null ? summary.avgLight : '--'}</span>
          <span>Peak: {summary.maxLight !== null ? summary.maxLight : '--'}</span>
        </div>
      </div>

      {/* Fire & Motion Events */}
      <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-semibold">Activity Events</span>
        </div>
        <p className="text-xl font-bold text-white font-mono">
          {summary.motionEvents} <span className="text-xs text-[#8B95A5]">motions</span>
        </p>
        <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
          <Flame className="w-3 h-3" />
          <span>{summary.fireEvents} Fire triggers</span>
        </div>
      </div>

      {/* Rain Events & Days */}
      <div className="p-4 rounded-2xl bg-[#151B23] border border-white/8">
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <CloudRain className="w-4 h-4" />
          <span className="text-xs font-semibold">Rain Records</span>
        </div>
        <p className="text-xl font-bold text-white font-mono">
          {summary.rainEvents} <span className="text-xs text-[#8B95A5]">events</span>
        </p>
        <div className="text-[10px] text-[#8B95A5] mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-indigo-400" />
          <span>{summary.rainyDays} Rainy days recorded</span>
        </div>
      </div>
    </div>
  );
};
