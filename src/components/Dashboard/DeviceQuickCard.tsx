import React from 'react';
import { Lightbulb, Lock, Unlock, ShieldAlert, Fan, Mic } from 'lucide-react';
import { DeviceState, ActiveTab } from '../../types';

interface DeviceQuickCardProps {
  devices: DeviceState;
  pendingDevice: keyof DeviceState | null;
  onToggleDevice: (device: keyof DeviceState, explicitValue?: boolean) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DeviceQuickCard: React.FC<DeviceQuickCardProps> = ({
  devices,
  pendingDevice,
  onToggleDevice,
  onNavigate,
}) => {
  return (
    <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Quick Controls</h3>
          <p className="text-xs text-[#8B95A5] mt-0.5">Real-time device dispatch (Fan Control Enabled)</p>
        </div>
        <button
          onClick={() => onNavigate('devices')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Main Light (Read-Only) */}
        <div
          className={`p-4 rounded-xl border text-left transition duration-200 flex flex-col justify-between h-28 select-none ${
            devices.light
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-white/5 border-white/8 text-[#8B95A5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                devices.light ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
              {devices.light ? 'ON' : 'OFF'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Main Light</p>
            <p className="text-[10px] text-[#8B95A5] truncate flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Read only</span>
            </p>
          </div>
        </div>

        {/* 2. Main Door (Read-Only) */}
        <div
          className={`p-4 rounded-xl border text-left transition duration-200 flex flex-col justify-between h-28 select-none ${
            devices.door
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                devices.door ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {devices.door ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
              {devices.door ? 'UNLOCKED' : 'LOCKED'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Front Door</p>
            <p className="text-[10px] text-[#8B95A5] truncate flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Read only</span>
            </p>
          </div>
        </div>

        {/* 3. Alarm (Read-Only) */}
        <div
          className={`p-4 rounded-xl border text-left transition duration-200 flex flex-col justify-between h-28 select-none ${
            devices.alarm
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse'
              : 'bg-white/5 border-white/8 text-[#8B95A5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                devices.alarm ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-slate-400'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
              {devices.alarm ? 'ARMED' : 'OFF'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Siren Alarm</p>
            <p className="text-[10px] text-[#8B95A5] truncate flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Read only</span>
            </p>
          </div>
        </div>

        {/* 4. Fan (Full Control) */}
        <button
          onClick={() => onToggleDevice('fan')}
          disabled={pendingDevice === 'fan'}
          className={`p-4 rounded-xl border text-left transition duration-200 flex flex-col justify-between h-28 cursor-pointer ${
            devices.fan
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-white/5 border-white/8 text-[#8B95A5] hover:bg-white/8 hover:text-white'
          } ${pendingDevice === 'fan' ? 'opacity-60 cursor-wait' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                devices.fan ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
              }`}
            >
              <Fan className={`w-4 h-4 ${devices.fan ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-cyan-300">
              {pendingDevice === 'fan' ? 'Sending...' : devices.fan ? 'RUNNING' : 'OFF'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Ventilation Fan</p>
            <p className="text-[10px] text-cyan-400 font-medium truncate">
              {devices.fan ? 'Active (Click to Stop)' : 'Inactive (Click to Start)'}
            </p>
          </div>
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleDevice('fan', true)}
            disabled={pendingDevice === 'fan'}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer disabled:opacity-50"
          >
            Turn Fan ON
          </button>
          <button
            onClick={() => onToggleDevice('fan', false)}
            disabled={pendingDevice === 'fan'}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8B95A5] hover:text-white text-xs font-semibold border border-white/8 transition cursor-pointer disabled:opacity-50"
          >
            Turn Fan OFF
          </button>
        </div>

        <button
          onClick={() => onNavigate('voice')}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Control</span>
        </button>
      </div>
    </div>
  );
};
