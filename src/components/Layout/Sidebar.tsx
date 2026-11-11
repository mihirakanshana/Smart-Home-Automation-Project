import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Sliders,
  ShieldCheck,
  AlertOctagon,
  Mic,
  Settings,
  Home,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { ActiveTab, SystemStatus } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  systemStatus: SystemStatus;
  firebaseOnline: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'devices', label: 'Devices', icon: Sliders },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'alerts', label: 'Alerts', icon: AlertOctagon },
  { id: 'voice', label: 'Voice Control', icon: Mic },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  systemStatus,
  firebaseOnline,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isOnline = firebaseOnline && systemStatus.systemOnline;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B0F14] border-r border-white/8 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              Smart Home
            </h2>
            <p className="text-[11px] text-[#8B95A5] font-medium tracking-tight">
              ESP32 IoT Hub
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-xl text-[#8B95A5] hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-[#8B95A5]/60 uppercase tracking-widest">
            Menu
          </span>
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
                  : 'text-[#8B95A5] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-indigo-400'
                      : 'text-[#8B95A5] group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-white/8 bg-[#151B23]/40">
        <div className="p-3 rounded-xl bg-[#151B23] border border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                  : !firebaseOnline
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <div>
              <p className="text-xs font-semibold text-white">
                {isOnline
                  ? 'System Online'
                  : !firebaseOnline
                  ? 'Reconnecting'
                  : 'ESP32 Offline'}
              </p>
              <p className="text-[10px] text-[#8B95A5]">
                {firebaseOnline ? 'RTDB Connected' : 'Cloud Disconnected'}
              </p>
            </div>
          </div>
          {systemStatus.wifiConnected ? (
            <Wifi className="w-4 h-4 text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-400" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
