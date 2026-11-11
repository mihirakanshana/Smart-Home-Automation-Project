import React from 'react';
import { Activity, Flame, Wind, CloudRain, Lock, Unlock, Shield } from 'lucide-react';
import { CurrentSensors, DeviceState, ActiveTab } from '../../types';
import { getGasStatus, getRainStatus } from '../../utils/thresholds';

interface SecurityQuickCardProps {
  sensors: CurrentSensors;
  devices: DeviceState;
  onNavigate: (tab: ActiveTab) => void;
}

export const SecurityQuickCard: React.FC<SecurityQuickCardProps> = ({
  sensors,
  devices,
  onNavigate,
}) => {
  const isMotion = sensors.motion === true;
  const isFire = sensors.fire === true;
  const gasStatus = getGasStatus(sensors.gas);
  const rainStatus = getRainStatus(sensors.rain, sensors.rainValue);
  const isDoorLocked = !devices.door;

  return (
    <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Security & Safety Status</h3>
            <p className="text-xs text-[#8B95A5]">Multi-zone sensor diagnostics</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('security')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
        >
          View security →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Motion */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isMotion ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-500/10 text-slate-400'
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Motion PIR</p>
              <p className="text-[10px] text-[#8B95A5]">Zone detector</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              isMotion
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {isMotion ? 'Motion Detected' : 'No Motion'}
          </span>
        </div>

        {/* 2. Fire */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isFire ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Fire / Smoke</p>
              <p className="text-[10px] text-[#8B95A5]">Optical flame sensor</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              isFire
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isFire ? 'FIRE DETECTED' : 'Safe / Clear'}
          </span>
        </div>

        {/* 3. Gas */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                gasStatus.level === 'Danger'
                  ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Gas Status</p>
              <p className="text-[10px] text-[#8B95A5]">
                {sensors.gas !== null ? `${Math.round(sensors.gas)} ppm` : '--'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${gasStatus.badgeClass}`}>
            {gasStatus.level === 'Danger' ? 'GAS LEAK DETECTED' : 'SAFE'}
          </span>
        </div>

        {/* 4. Rain */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                rainStatus.isRaining ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-500/10 text-slate-400'
              }`}
            >
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Precipitation</p>
              <p className="text-[10px] text-[#8B95A5]">Outdoor sensor</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${rainStatus.badgeClass}`}>
            {rainStatus.level}
          </span>
        </div>

        {/* 5. Door */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isDoorLocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-300'
              }`}
            >
              {isDoorLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Main Entrance</p>
              <p className="text-[10px] text-[#8B95A5]">Deadbolt relay</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              isDoorLocked
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {isDoorLocked ? 'Locked' : 'Unlocked'}
          </span>
        </div>
      </div>
    </div>
  );
};
