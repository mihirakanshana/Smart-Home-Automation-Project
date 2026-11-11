import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  Cpu,
  Database,
  Radio,
  Clock,
  Check,
  Save,
  Key,
} from 'lucide-react';
import { UserProfile, SystemStatus } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { GAS_DANGER_THRESHOLD } from '../../utils/thresholds';

interface SettingsViewProps {
  user: UserProfile | null;
  systemStatus: SystemStatus;
  firebaseOnline: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  systemStatus,
  firebaseOnline,
}) => {
  const { theme, setTheme } = useTheme();
  const [fireNotif, setFireNotif] = useState(true);
  const [gasNotif, setGasNotif] = useState(true);
  const [rainNotif, setRainNotif] = useState(true);
  const [motionNotif, setMotionNotif] = useState(true);
  const [deviceNotif, setDeviceNotif] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white tracking-tight">System & App Configuration</h2>
        <p className="text-xs text-[#8B95A5] mt-1">
          Manage your account profile, notification policies, appearance, and ESP32 telemetry links
        </p>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* 1. Profile Section */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Operator Profile</h3>
            <p className="text-xs text-[#8B95A5]">Authenticated Firebase account credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#8B95A5] font-semibold block mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              readOnly
              value={user?.displayName || 'Smart Home Master'}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs text-[#8B95A5] font-semibold block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || 'mihirakanshana2k04@gmail.com'}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-[#8B95A5] font-semibold block mb-1.5">
              User UID
            </label>
            <input
              type="text"
              readOnly
              value={user?.uid || 'firebase-admin-auth'}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#8B95A5] font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-[#8B95A5] font-semibold block mb-1.5">
              Access Tier
            </label>
            <input
              type="text"
              readOnly
              value={user?.isAnonymous ? 'Guest Explorer' : 'Super Administrator (Full I/O)'}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-indigo-400 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 2. Appearance Section */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Appearance & Theme</h3>
            <p className="text-xs text-[#8B95A5]">Theme presets optimized for high contrast dark telemetry</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border text-center transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 font-semibold shadow-sm'
                : 'bg-white/5 border-white/8 text-[#8B95A5] hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 mx-auto mb-1.5" />
            <span className="text-xs">Dark (Default)</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border text-center transition cursor-pointer ${
              theme === 'light'
                ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 font-semibold'
                : 'bg-white/5 border-white/8 text-[#8B95A5] hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 mx-auto mb-1.5" />
            <span className="text-xs">Light</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-xl border text-center transition cursor-pointer ${
              theme === 'system'
                ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 font-semibold'
                : 'bg-white/5 border-white/8 text-[#8B95A5] hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 mx-auto mb-1.5" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </div>

      {/* 3. Notification Policies */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Notification Alert Preferences</h3>
            <p className="text-xs text-[#8B95A5]">Select which physical events trigger in-app banners</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Critical Fire / Smoke Triggers', state: fireNotif, set: setFireNotif },
            { label: `Hazardous Gas Concentration (>= ${GAS_DANGER_THRESHOLD} ppm)`, state: gasNotif, set: setGasNotif },
            { label: 'Precipitation & Rain Sensor Events', state: rainNotif, set: setRainNotif },
            { label: 'PIR Motion Zone Activations', state: motionNotif, set: setMotionNotif },
            { label: 'Device Relay State Switches', state: deviceNotif, set: setDeviceNotif },
          ].map((item, idx) => (
            <label
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition cursor-pointer"
            >
              <span className="text-xs font-medium text-white">{item.label}</span>
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 4. Firebase RTDB & ESP32 System Diagnostics */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Firebase & Hardware Diagnostics</h3>
            <p className="text-xs text-[#8B95A5]">Live connectivity metrics and database endpoint references</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
            <span className="text-[#8B95A5]">Firebase RTDB URL</span>
            <span className="text-white font-mono text-[11px] truncate max-w-[280px]">
              smart-home-automation-b6825-default-rtdb.asia-southeast1.firebasedatabase.app
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
            <span className="text-[#8B95A5]">Client Connection State (.info/connected)</span>
            <StatusBadge
              label={firebaseOnline ? 'Connected' : 'Disconnected'}
              variant={firebaseOnline ? 'success' : 'danger'}
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
            <span className="text-[#8B95A5]">ESP32 Controller Status</span>
            <StatusBadge
              label={systemStatus.systemOnline ? 'Online' : 'Standby / Offline'}
              variant={systemStatus.systemOnline ? 'success' : 'neutral'}
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
            <span className="text-[#8B95A5]">ESP32 WiFi Connection</span>
            <StatusBadge
              label={systemStatus.wifiConnected ? 'WiFi Associated' : 'No WiFi'}
              variant={systemStatus.wifiConnected ? 'success' : 'neutral'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
