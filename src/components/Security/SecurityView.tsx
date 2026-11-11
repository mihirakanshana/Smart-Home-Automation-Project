import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  CreditCard,
  Lock,
  Unlock,
  KeyRound,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';
import { CurrentSensors, DeviceState, RFIDRecord } from '../../types';
import { subscribeRFIDHistory } from '../../firebase/database';
import { StatusBadge } from '../Common/StatusBadge';
import { EmptyState } from '../Common/EmptyState';

interface SecurityViewProps {
  sensors: CurrentSensors;
  devices: DeviceState;
  pendingDevice?: keyof DeviceState | null;
  onToggleDoor?: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  sensors,
  devices,
}) => {
  const [rfidRecords, setRfidRecords] = useState<RFIDRecord[]>([]);
  const [loadingRfid, setLoadingRfid] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeRFIDHistory((records) => {
      setRfidRecords(records);
      setLoadingRfid(false);
    });

    return () => unsub();
  }, []);

  const isMotion = sensors.motion === true;
  const isDoorLocked = !devices.door;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Security & Access Control Matrix</span>
        </h2>
        <p className="text-xs text-[#8B95A5] mt-1">
          Independent security subsystem telemetry for PIR motion sensing, electronic door locking, and RFID authentication
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. PIR Motion Detection System */}
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isMotion ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400'
                }`}
              >
                <Activity className="w-6 h-6" />
              </div>
              <StatusBadge
                label={isMotion ? 'Motion Detected' : 'No Motion'}
                variant={isMotion ? 'info' : 'neutral'}
                pulse={isMotion}
              />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              PIR Passive Infrared Motion
            </h3>
            <p className="text-xs text-[#8B95A5] mt-1">
              Path: <code className="text-indigo-300 font-mono">Sensors/CurrentData/motion</code>
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 my-5">
              <div className="flex items-center justify-between text-xs text-[#8B95A5] mb-2">
                <span>Sensor State:</span>
                <span className="font-mono text-white font-semibold">
                  {isMotion ? 'HIGH (Active Signal)' : 'LOW (Idle)'}
                </span>
              </div>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                {isMotion
                  ? 'Infrared thermal variance detected within the motion detection perimeter.'
                  : 'No active movement detected in the monitored perimeter.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-[#8B95A5]">
            Updates automatically via real-time Firebase listener
          </div>
        </div>

        {/* 2. Main Door Deadbolt Lock */}
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDoorLocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {isDoorLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              </div>
              <StatusBadge
                label={isDoorLocked ? 'Locked' : 'Unlocked'}
                variant={isDoorLocked ? 'success' : 'warning'}
              />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Main Electronic Door Deadbolt
            </h3>
            <p className="text-xs text-[#8B95A5] mt-1">
              Path: <code className="text-indigo-300 font-mono">Devices/CurrentState/door</code>
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 my-5">
              <div className="flex items-center justify-between text-xs text-[#8B95A5] mb-2">
                <span>Current State:</span>
                <span className="font-mono text-white font-semibold">
                  {isDoorLocked ? 'Solenoid Engaged' : 'Solenoid Released'}
                </span>
              </div>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                {isDoorLocked
                  ? 'Entrance is securely locked with physical deadbolt engaged.'
                  : 'Entrance is currently unlocked. Anyone can open the door.'}
              </p>
            </div>
          </div>

          <div className="w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-white/5 border border-white/8 text-[#8B95A5]">
            {isDoorLocked ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-amber-400" />}
            <span>{isDoorLocked ? 'Door Locked (Read Only)' : 'Door Unlocked (Read Only)'}</span>
          </div>
        </div>

        {/* 3. RFID Card Access System */}
        <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <StatusBadge label="RC522 RFID" variant="neutral" />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              RFID Contactless Access
            </h3>
            <p className="text-xs text-[#8B95A5] mt-1">
              Path: <code className="text-indigo-300 font-mono">Security/RFID</code>
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 my-5">
              <div className="flex items-center justify-between text-xs text-[#8B95A5] mb-2">
                <span>Access Logs Count:</span>
                <span className="font-mono text-white font-semibold">
                  {rfidRecords.length} records
                </span>
              </div>
              <p className="text-xs text-[#8B95A5] leading-relaxed">
                Contactless keycard and tag verification system for authorized personnel entry.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-[#8B95A5]">
            Operates independently from PIR sensor
          </div>
        </div>
      </div>

      {/* RFID Access History Logs Table */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>RFID Keycard Authentication History</span>
          </h4>
          <span className="text-xs text-[#8B95A5]">{rfidRecords.length} entries</span>
        </div>

        {loadingRfid ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rfidRecords.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No RFID access history available"
            description="No RFID swipe events have been recorded yet in Firebase Realtime Database. As cards are scanned on your RC522 module, authentication logs will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-[#8B95A5]">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Card UID</th>
                  <th className="pb-3 font-semibold">User / Label</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {rfidRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-[#8B95A5]">
                      {rec.timestamp.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 font-mono">{rec.cardUid}</td>
                    <td className="py-3">{rec.userName || 'Authorized Key'}</td>
                    <td className="py-3 text-right">
                      {rec.accessGranted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Granted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Denied</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
