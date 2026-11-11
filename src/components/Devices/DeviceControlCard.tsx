import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from '../Common/StatusBadge';

interface DeviceControlCardProps {
  id: string;
  name: string;
  location: string;
  icon: LucideIcon;
  isOn: boolean;
  isPending?: boolean;
  onToggle?: () => void;
  activeColor: string;
  activeBg: string;
  activeLabel: string;
  inactiveLabel: string;
  description: string;
  readOnly?: boolean;
}

export const DeviceControlCard: React.FC<DeviceControlCardProps> = ({
  id,
  name,
  location,
  icon: Icon,
  isOn,
  isPending = false,
  onToggle,
  activeColor,
  activeBg,
  activeLabel,
  inactiveLabel,
  description,
  readOnly = false,
}) => {
  return (
    <div
      id={id}
      className={`bg-[#151B23] border rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between ${
        isOn ? 'border-white/20 shadow-lg shadow-black/40' : 'border-white/8 hover:border-white/15'
      }`}
    >
      {/* Top row: Icon, Name, Location, Status Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isOn ? `${activeBg} ${activeColor}` : 'bg-white/5 text-slate-400'
            }`}
          >
            <Icon className={`w-6 h-6 ${isOn && name.includes('Fan') ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{name}</h3>
            <p className="text-xs text-[#8B95A5]">{location}</p>
          </div>
        </div>

        <StatusBadge
          label={isPending ? 'Sending...' : isOn ? activeLabel : inactiveLabel}
          variant={isOn ? 'success' : 'neutral'}
          pulse={isOn}
        />
      </div>

      {/* Middle Description */}
      <p className="text-xs text-[#8B95A5] my-6 leading-relaxed">
        {description}
      </p>

      {/* Bottom Switch / Control Action */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider block">
            Relay Status
          </span>
          <span className="text-xs font-mono font-semibold text-white">
            {isOn ? 'Active (High)' : 'Standby (Low)'}
          </span>
        </div>

        {readOnly ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[11px] font-medium text-[#8B95A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Read only</span>
          </div>
        ) : (
          /* Custom iOS-style toggle switch for Fan */
          <button
            onClick={onToggle}
            disabled={isPending}
            aria-label={`Toggle ${name}`}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#151B23] ${
              isOn ? 'bg-indigo-600' : 'bg-white/10'
            } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                isOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {isPending && (
                <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
