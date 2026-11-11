import React from 'react';
import { Flame, AlertTriangle, ArrowRight } from 'lucide-react';
import { CurrentSensors, ActiveTab } from '../../types';
import { getGasStatus, GAS_DANGER_THRESHOLD } from '../../utils/thresholds';

interface CriticalAlertBannerProps {
  sensors: CurrentSensors;
  onNavigate: (tab: ActiveTab) => void;
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  sensors,
  onNavigate,
}) => {
  const isFire = sensors.fire === true;
  const gasStatus = getGasStatus(sensors.gas);
  const isGasDanger = gasStatus.level === 'Danger';

  if (!isFire && !isGasDanger) {
    return null;
  }

  return (
    <div className="w-full bg-rose-600 text-white px-4 py-2.5 shadow-lg border-b border-rose-400/30 flex items-center justify-between flex-wrap gap-2 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center animate-bounce">
          {isFire ? <Flame className="w-5 h-5 text-white" /> : <AlertTriangle className="w-5 h-5 text-white" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-xs uppercase px-2 py-0.5 bg-black/30 rounded">
              DANGER
            </span>
            <span className="font-semibold text-sm">
              {isFire && isGasDanger
                ? 'FIRE & GAS LEAK DETECTED!'
                : isFire
                ? '🔥 FIRE / FLAME DETECTED'
                : '🚨 GAS LEAK DETECTED'}
            </span>
          </div>
          <p className="text-xs text-rose-100 mt-0.5">
            {isFire
              ? 'ESP32 flame sensor has triggered. Immediate safety response and evacuation advised.'
              : `Current gas sensor level is ${Math.round(sensors.gas || 0)} ppm (Danger threshold >= ${GAS_DANGER_THRESHOLD} ppm). Immediate attention required.`}
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate('alerts')}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black/30 hover:bg-black/40 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
      >
        <span>View Alert Center</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
