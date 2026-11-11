import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from '../Common/StatusBadge';

interface SensorCardProps {
  id: string;
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  badgePulse?: boolean;
  subtext: string;
  secondaryValue?: string;
  secondaryLabel?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  id,
  title,
  value,
  unit,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  badgeLabel,
  badgeVariant,
  badgePulse = false,
  subtext,
  secondaryValue,
  secondaryLabel,
}) => {
  return (
    <div
      id={id}
      className="bg-[#151B23] border border-white/8 hover:border-white/15 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between group"
    >
      {/* Top row: Icon & Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${iconBgClass} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <StatusBadge
          label={badgeLabel}
          variant={badgeVariant}
          pulse={badgePulse}
        />
      </div>

      {/* Center: Metric Value & Label */}
      <div>
        <p className="text-xs font-medium text-[#8B95A5] uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            {value}
          </span>
          {unit && <span className="text-sm font-semibold text-[#8B95A5]">{unit}</span>}
        </div>
      </div>

      {/* Bottom: Subtext & Optional Secondary Value */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#8B95A5]">
        <span className="truncate">{subtext}</span>
        {secondaryValue && (
          <span className="shrink-0 font-mono text-white/80">
            {secondaryLabel ? `${secondaryLabel}: ` : ''}
            {secondaryValue}
          </span>
        )}
      </div>
    </div>
  );
};
