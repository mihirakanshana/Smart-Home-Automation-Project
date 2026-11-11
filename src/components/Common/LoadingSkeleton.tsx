import React from 'react';

export const SensorCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151B23] border border-white/8 rounded-2xl p-5 animate-pulse flex flex-col justify-between h-44">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="w-16 h-5 rounded-full bg-white/5" />
      </div>
      <div>
        <div className="w-20 h-4 rounded bg-white/5 mb-2" />
        <div className="w-28 h-8 rounded bg-white/5" />
      </div>
      <div className="w-32 h-3 rounded bg-white/5" />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="w-48 h-6 rounded bg-white/5" />
        <div className="w-32 h-8 rounded bg-white/5" />
      </div>
      <div className="w-full h-72 rounded-xl bg-white/5" />
    </div>
  );
};

export const DeviceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151B23] border border-white/8 rounded-2xl p-6 animate-pulse flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5" />
        <div>
          <div className="w-24 h-5 rounded bg-white/5 mb-2" />
          <div className="w-16 h-3 rounded bg-white/5" />
        </div>
      </div>
      <div className="w-14 h-7 rounded-full bg-white/5" />
    </div>
  );
};
