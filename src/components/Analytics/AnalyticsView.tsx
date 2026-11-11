import React, { useState } from 'react';
import {
  CurrentSensors,
  SensorReading,
} from '../../types';
import { SummaryStatistics, RainAnalytics } from '../../utils/analytics';
import { DailyAnalyticsView } from './DailyAnalyticsView';
import { MonthlyAnalyticsView } from './MonthlyAnalyticsView';
import { YearlyAnalyticsView } from './YearlyAnalyticsView';
import { RainAnalyticsView } from './RainAnalyticsView';
import { BarChart3, Calendar, CalendarDays, CloudRain, Clock } from 'lucide-react';
import { EmptyState } from '../Common/EmptyState';
import { ANALYTICS_PREVIEW_MODE, SAMPLE_ANALYTICS_DATA } from '../../utils/sampleAnalyticsData';

interface AnalyticsViewProps {
  sensors: CurrentSensors;
  readings: SensorReading[];
  summary: SummaryStatistics;
  rainAnalytics: RainAnalytics;
  loading: boolean;
}

type AnalyticsTab = 'daily' | 'monthly' | 'yearly' | 'rain';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sensors,
  readings,
  summary,
  rainAnalytics,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('daily');

  // When ANALYTICS_PREVIEW_MODE is true, use the stable local sample dataset.
  // When false, seamlessly return to real Firebase Realtime Database telemetry.
  const activeReadings = ANALYTICS_PREVIEW_MODE ? SAMPLE_ANALYTICS_DATA.readings : readings;
  const activeSummary = ANALYTICS_PREVIEW_MODE ? SAMPLE_ANALYTICS_DATA.summary : summary;
  const activeRainAnalytics = ANALYTICS_PREVIEW_MODE ? SAMPLE_ANALYTICS_DATA.rainAnalytics : rainAnalytics;
  const activeLoading = ANALYTICS_PREVIEW_MODE ? false : loading;

  const tabs: { id: AnalyticsTab; label: string; icon: React.ElementType }[] = [
    { id: 'daily', label: 'Daily Analytics', icon: Clock },
    { id: 'monthly', label: 'Monthly Analytics', icon: CalendarDays },
    { id: 'yearly', label: 'Yearly Analytics', icon: Calendar },
    { id: 'rain', label: 'Rain Analytics', icon: CloudRain },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Telemetry & Historical Analytics</span>
            {ANALYTICS_PREVIEW_MODE && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                Analytics Preview
              </span>
            )}
          </h2>
          <p className="text-xs text-[#8B95A5] mt-1">
            {ANALYTICS_PREVIEW_MODE
              ? 'Analyzing preview sensor records from 18 Aug 2026 to 24 Aug 2026'
              : `Analyzing ${activeReadings.length} historical records recorded from your ESP32 in Firebase Realtime Database`}
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/8 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#8B95A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeLoading ? (
        <div className="h-64 flex items-center justify-center bg-[#151B23] border border-white/8 rounded-2xl">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeReadings.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No sensor history available yet"
          description="Your Firebase database does not have any recorded readings at 'sensor_readings'. As your ESP32 streams logs, historical charts will automatically appear."
        />
      ) : (
        <>
          {activeTab === 'daily' && <DailyAnalyticsView readings={activeReadings} />}
          {activeTab === 'monthly' && <MonthlyAnalyticsView readings={activeReadings} />}
          {activeTab === 'yearly' && <YearlyAnalyticsView readings={activeReadings} />}
          {activeTab === 'rain' && (
            <RainAnalyticsView
              sensors={sensors}
              readings={activeReadings}
              rainAnalytics={activeRainAnalytics}
            />
          )}
        </>
      )}
    </div>
  );
};
