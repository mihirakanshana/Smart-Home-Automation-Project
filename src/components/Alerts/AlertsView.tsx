import React from 'react';
import { Flame, AlertTriangle, ShieldCheck, CloudRain, CheckCircle, ShieldAlert } from 'lucide-react';
import { CurrentSensors, DeviceState } from '../../types';
import { getGasStatus, getRainStatus } from '../../utils/thresholds';

interface AlertsViewProps {
  sensors: CurrentSensors;
  devices: DeviceState;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ sensors, devices }) => {
  const isFire = sensors.fire === true;
  const gasStatus = getGasStatus(sensors.gas);
  const rainStatus = getRainStatus(sensors.rain, sensors.rainValue);
  const isMotion = sensors.motion === true;
  const isAlarmArmed = devices.alarm;

  const totalWarnings =
    (isFire ? 1 : 0) +
    (gasStatus.level === 'Danger' ? 1 : 0) +
    (isAlarmArmed ? 1 : 0) +
    (rainStatus.isRaining ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Alerts Header Banner */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <span>Hazard & Safety Alert Center</span>
          </h2>
          <p className="text-xs text-[#8B95A5] mt-1">
            Real-time critical safety matrix driven directly by physical ESP32 sensors
          </p>
        </div>

        <div>
          {totalWarnings === 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>You're all clear</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>{totalWarnings} Active Alert{totalWarnings > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Core Alert Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Fire Alert Section */}
        <div
          className={`bg-[#151B23] border rounded-2xl p-6 transition-all ${
            isFire
              ? 'border-rose-500 bg-rose-950/20 shadow-xl shadow-rose-950/40'
              : 'border-white/8'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isFire ? 'bg-rose-500 text-white animate-bounce' : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <Flame className="w-6 h-6" />
            </div>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isFire
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isFire ? '🔥 DANGER' : 'SAFE'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {isFire ? '🔥 FIRE DETECTED' : 'No Fire Detected'}
          </h3>
          <p
            className={`text-xs font-medium mt-1 mb-4 ${
              isFire ? 'text-rose-300 font-semibold' : 'text-[#8B95A5]'
            }`}
          >
            {isFire
              ? 'Immediate attention and emergency response required!'
              : 'Optical flame sensor reporting standard infrared baseline.'}
          </p>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[#8B95A5] flex items-center justify-between font-mono">
            <span>Sensors/CurrentData/fire</span>
            <span className={isFire ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isFire ? 'TRUE' : 'FALSE'}
            </span>
          </div>
        </div>

        {/* 2. Gas Alert Section */}
        <div
          className={`bg-[#151B23] border rounded-2xl p-6 transition-all ${
            gasStatus.level === 'Danger'
              ? 'border-rose-500 bg-rose-950/30 shadow-xl shadow-rose-950/50 ring-1 ring-rose-500/50'
              : 'border-white/8'
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                gasStatus.level === 'Danger'
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${gasStatus.badgeClass}`}
            >
              {gasStatus.level === 'Danger' ? 'GAS LEAK DETECTED' : 'SAFE'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {gasStatus.level === 'Danger' ? '🚨 GAS LEAK DETECTED' : 'Gas & Air Safety'}
          </h3>
          <p
            className={`text-xs font-medium mt-1 mb-4 ${
              gasStatus.level === 'Danger' ? 'text-rose-300 font-semibold' : 'text-[#8B95A5]'
            }`}
          >
            {gasStatus.level === 'Danger'
              ? 'Immediate attention required'
              : 'No gas leak detected'}
          </p>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[#8B95A5] flex items-center justify-between font-mono">
            <span>Sensors/CurrentData/gas</span>
            <span className={gasStatus.level === 'Danger' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {sensors.gas !== null ? `${Math.round(sensors.gas)} ppm` : '--'}
            </span>
          </div>
        </div>

        {/* 3. Security Alert Section */}
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isAlarmArmed
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-indigo-500/10 text-indigo-400'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isAlarmArmed
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}
            >
              {isAlarmArmed ? 'ALARM ARMED' : 'ARMED / SECURE'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            Intrusion & Motion Monitor
          </h3>
          <p className="text-xs text-[#8B95A5] mt-1 mb-4">
            {isMotion
              ? 'PIR motion sensor active — movement detected in monitored zone.'
              : 'Perimeter clear. No anomalous motion events.'}
          </p>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[#8B95A5] flex items-center justify-between font-mono">
            <span>PIR Status</span>
            <span className={isMotion ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
              {isMotion ? 'MOTION DETECTED' : 'NO MOTION'}
            </span>
          </div>
        </div>

        {/* 4. Weather / Rain Alert Section */}
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                rainStatus.isRaining
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-slate-500/10 text-slate-400'
              }`}
            >
              <CloudRain className="w-6 h-6" />
            </div>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${rainStatus.badgeClass}`}
            >
              {rainStatus.level}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            Exterior Precipitation
          </h3>
          <p className="text-xs text-[#8B95A5] mt-1 mb-4">{rainStatus.description}</p>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-[#8B95A5] flex items-center justify-between font-mono">
            <span>Sensors/CurrentData/rain</span>
            <span className="text-white font-bold">{rainStatus.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
