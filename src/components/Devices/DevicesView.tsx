import React from 'react';
import { Lightbulb, Lock, ShieldAlert, Fan, Sliders, Zap, CheckCircle2 } from 'lucide-react';
import { DeviceState } from '../../types';
import { DeviceControlCard } from './DeviceControlCard';

interface DevicesViewProps {
  devices: DeviceState;
  pendingDevice: keyof DeviceState | null;
  onToggleDevice: (device: keyof DeviceState, explicitValue?: boolean) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  pendingDevice,
  onToggleDevice,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Info & Fan Actions */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Connected Appliance & Actuator Relays</span>
          </h2>
          <p className="text-xs text-[#8B95A5] mt-1">
            Real-time synchronization via Firebase Realtime Database at <code className="text-indigo-300 font-mono">Devices/CurrentState</code> (Fan Control Enabled)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleDevice('fan', true)}
            disabled={pendingDevice === 'fan'}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer disabled:opacity-50"
          >
            Turn Fan ON
          </button>
          <button
            onClick={() => onToggleDevice('fan', false)}
            disabled={pendingDevice === 'fan'}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8B95A5] hover:text-white text-xs font-semibold border border-white/8 transition cursor-pointer disabled:opacity-50"
          >
            Turn Fan OFF
          </button>
        </div>
      </div>

      {/* Grid of 4 Core Devices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 1. Main Light (Read-Only) */}
        <DeviceControlCard
          id="device-light-card"
          name="Main Living Light"
          location="Living Room / Relay 1"
          icon={Lightbulb}
          isOn={devices.light}
          readOnly={true}
          activeColor="text-amber-400"
          activeBg="bg-amber-500/20"
          activeLabel="Light ON"
          inactiveLabel="Light OFF"
          description="Main illumination circuit connected to ESP32 digital output pin for primary room lighting. (Read-only)"
        />

        {/* 2. Main Door (Read-Only) */}
        <DeviceControlCard
          id="device-door-card"
          name="Main Entrance Door"
          location="Front Porch / Solenoid Lock"
          icon={Lock}
          isOn={devices.door}
          readOnly={true}
          activeColor="text-indigo-400"
          activeBg="bg-indigo-500/20"
          activeLabel="Door UNLOCKED"
          inactiveLabel="Door LOCKED"
          description="Electronic deadbolt lock mechanism with real-time status reporting from ESP32. (Read-only)"
        />

        {/* 3. Siren Alarm (Read-Only) */}
        <DeviceControlCard
          id="device-alarm-card"
          name="Security Siren Alarm"
          location="Central Hallway / Buzzer"
          icon={ShieldAlert}
          isOn={devices.alarm}
          readOnly={true}
          activeColor="text-rose-400"
          activeBg="bg-rose-500/20"
          activeLabel="Alarm ARMED / SOUNDING"
          inactiveLabel="Alarm DISARMED"
          description="High-decibel piezoelectric buzzer output for intruder deterrence and emergency evacuation alerts. (Read-only)"
        />

        {/* 4. Ventilation Fan (Controllable) */}
        <DeviceControlCard
          id="device-fan-card"
          name="Exhaust & Air Fan"
          location="Ventilation Duct / Relay 2"
          icon={Fan}
          isOn={devices.fan}
          isPending={pendingDevice === 'fan'}
          readOnly={false}
          onToggle={() => onToggleDevice('fan')}
          activeColor="text-cyan-400"
          activeBg="bg-cyan-500/20"
          activeLabel="Fan RUNNING"
          inactiveLabel="Fan OFF"
          description="High-throughput air circulation fan for temperature moderation and rapid gas clearance. Controllable from web app."
        />
      </div>

      {/* Device Architecture Note */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
        <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200/80 leading-relaxed">
          <strong className="text-white">Authoritative Device Synchronization:</strong> The Fan is directly controllable and updates <code className="text-cyan-300 font-mono">Devices/CurrentState/fan</code> in real time. Light, Door, and Alarm channels reflect real-time telemetry from the physical hardware in read-only mode.
        </div>
      </div>
    </div>
  );
};
