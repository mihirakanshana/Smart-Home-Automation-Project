import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Radio,
  Cpu,
  Wifi,
} from 'lucide-react';
import {
  CurrentSensors,
  DeviceState,
  SystemStatus,
  SensorReading,
  ActiveTab,
} from '../../types';
import { SensorCard } from './SensorCard';
import { DeviceQuickCard } from './DeviceQuickCard';
import { SecurityQuickCard } from './SecurityQuickCard';
import { EnvironmentChart } from './EnvironmentChart';
import { SensorCardSkeleton } from '../Common/LoadingSkeleton';
import {
  formatTemperature,
  formatHumidity,
  formatGasValue,
  formatLightValue,
  formatRainValue,
} from '../../utils/validation';
import {
  getTemperatureStatus,
  getHumidityStatus,
  getGasStatus,
  getLightStatus,
  getRainStatus,
} from '../../utils/thresholds';

interface DashboardViewProps {
  sensors: CurrentSensors;
  devices: DeviceState;
  systemStatus: SystemStatus;
  firebaseOnline: boolean;
  historicalReadings: SensorReading[];
  loadingSensors: boolean;
  loadingHistory: boolean;
  pendingDevice: keyof DeviceState | null;
  onToggleDevice: (device: keyof DeviceState, explicitValue?: boolean) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sensors,
  devices,
  systemStatus,
  firebaseOnline,
  historicalReadings,
  loadingSensors,
  loadingHistory,
  pendingDevice,
  onToggleDevice,
  onNavigate,
}) => {
  const tempStatus = getTemperatureStatus(sensors.temperature);
  const humidityStatus = getHumidityStatus(sensors.humidity);
  const gasStatus = getGasStatus(sensors.gas);
  const lightStatus = getLightStatus(sensors.light);
  const rainStatus = getRainStatus(sensors.rain, sensors.rainValue);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 18) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {getGreeting()}
            </h2>
            <p className="text-sm text-[#8B95A5] mt-1">
              Here's your home overview. All telemetry is streaming live from your ESP32 controller.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/8 flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider">
                  Controller
                </p>
                <p className="text-xs font-semibold text-white">
                  {systemStatus.systemOnline ? 'ESP32 Node (Active)' : 'ESP32 Standby'}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/8 flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-[10px] text-[#8B95A5] uppercase font-bold tracking-wider">
                  Data Stream
                </p>
                <p className="text-xs font-semibold text-white">
                  {firebaseOnline ? 'RTDB Live' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Live Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loadingSensors ? (
          <>
            <SensorCardSkeleton />
            <SensorCardSkeleton />
            <SensorCardSkeleton />
            <SensorCardSkeleton />
            <SensorCardSkeleton />
          </>
        ) : (
          <>
            {/* 1. Temperature */}
            <SensorCard
              id="sensor-temperature-card"
              title="Temperature"
              value={
                sensors.temperature !== null
                  ? sensors.temperature.toFixed(1)
                  : '--'
              }
              unit="°C"
              icon={Thermometer}
              iconBgClass="bg-rose-500/10"
              iconColorClass="text-rose-400"
              badgeLabel={tempStatus.level}
              badgeVariant={tempStatus.variant}
              subtext={tempStatus.description}
            />

            {/* 2. Humidity */}
            <SensorCard
              id="sensor-humidity-card"
              title="Humidity"
              value={
                sensors.humidity !== null
                  ? sensors.humidity.toFixed(1)
                  : '--'
              }
              unit="%"
              icon={Droplets}
              iconBgClass="bg-cyan-500/10"
              iconColorClass="text-cyan-400"
              badgeLabel={humidityStatus.level}
              badgeVariant={humidityStatus.variant}
              subtext={humidityStatus.description}
            />

            {/* 3. Gas Level */}
            <SensorCard
              id="sensor-gas-card"
              title="Gas Level"
              value={formatGasValue(sensors.gas)}
              unit="ppm"
              icon={Wind}
              iconBgClass={gasStatus.level === 'Danger' ? 'bg-rose-500/20' : 'bg-emerald-500/10'}
              iconColorClass={gasStatus.level === 'Danger' ? 'text-rose-400' : 'text-emerald-400'}
              badgeLabel={gasStatus.level === 'Danger' ? 'GAS LEAK DETECTED' : 'SAFE'}
              badgeVariant={gasStatus.level === 'Danger' ? 'danger' : 'success'}
              badgePulse={gasStatus.level === 'Danger'}
              subtext={
                gasStatus.level === 'Danger'
                  ? 'DANGER - Immediate attention required'
                  : 'SAFE - No gas leak detected'
              }
            />

            {/* 4. Ambient Light */}
            <SensorCard
              id="sensor-light-card"
              title="Light Level"
              value={formatLightValue(sensors.light)}
              unit="adc"
              icon={Sun}
              iconBgClass="bg-yellow-500/10"
              iconColorClass="text-yellow-400"
              badgeLabel={lightStatus.level}
              badgeVariant={
                lightStatus.level === 'Bright'
                  ? 'warning'
                  : lightStatus.level === 'Dim'
                  ? 'info'
                  : 'neutral'
              }
              subtext={lightStatus.description}
            />

            {/* 5. Rain Sensor */}
            <SensorCard
              id="sensor-rain-card"
              title="Rain Sensor"
              value={
                rainStatus.level === 'Rain Detected'
                  ? 'Active'
                  : rainStatus.level === 'No Rain'
                  ? 'Dry'
                  : 'No data'
              }
              icon={CloudRain}
              iconBgClass="bg-indigo-500/10"
              iconColorClass="text-indigo-400"
              badgeLabel={rainStatus.level}
              badgeVariant={
                rainStatus.level === 'Rain Detected'
                  ? 'info'
                  : rainStatus.level === 'No Rain'
                  ? 'neutral'
                  : 'neutral'
              }
              subtext={rainStatus.description}
              secondaryLabel="Analog"
              secondaryValue={formatRainValue(sensors.rainValue)}
            />
          </>
        )}
      </div>

      {/* Quick Controls Section */}
      <DeviceQuickCard
        devices={devices}
        pendingDevice={pendingDevice}
        onToggleDevice={onToggleDevice}
        onNavigate={onNavigate}
      />

      {/* Security & Safety Overview Bar */}
      <SecurityQuickCard
        sensors={sensors}
        devices={devices}
        onNavigate={onNavigate}
      />

      {/* Real-time Environment History Chart */}
      <EnvironmentChart
        readings={historicalReadings}
        loading={loadingHistory}
      />
    </div>
  );
};
