import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  LogOut,
  User,
  Clock,
  Check,
  Trash2,
  Flame,
  AlertTriangle,
  CloudRain,
  Activity,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { ActiveTab, UserProfile, SystemStatus, NotificationItem } from '../../types';
import { StatusBadge } from '../Common/StatusBadge';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  activeTab: ActiveTab;
  user: UserProfile | null;
  systemStatus: SystemStatus;
  firebaseOnline: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllNotificationsRead: () => void;
  onClearNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  user,
  systemStatus,
  firebaseOnline,
  notifications,
  unreadCount,
  onMarkAllNotificationsRead,
  onClearNotification,
  onClearAllNotifications,
  onLogout,
  onToggleMobileMenu,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'analytics':
        return 'Historical Analytics';
      case 'devices':
        return 'Device Controls';
      case 'security':
        return 'Security & Access';
      case 'alerts':
        return 'Alerts & Safety';
      case 'voice':
        return 'Voice Assistant';
      case 'settings':
        return 'System Settings';
      default:
        return 'Smart Home';
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'gas':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'motion':
        return <Activity className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="h-18 bg-[#0B0F14]/90 backdrop-blur-md border-b border-white/8 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#8B95A5] hover:text-white hover:bg-white/5 transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <span>{getPageTitle()}</span>
          </h1>
          <p className="text-xs text-[#8B95A5] hidden sm:block">
            ESP32 Intelligent Home Monitoring & Control
          </p>
        </div>
      </div>

      {/* Right side: Status, Live Clock, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* ESP32 / Firebase Online Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151B23] border border-white/8">
          <StatusBadge
            label={
              !firebaseOnline
                ? 'Reconnecting...'
                : systemStatus.systemOnline
                ? 'ESP32 Online'
                : 'ESP32 Offline'
            }
            variant={
              !firebaseOnline
                ? 'warning'
                : systemStatus.systemOnline
                ? 'success'
                : 'neutral'
            }
            pulse={systemStatus.systemOnline}
          />
        </div>

        {/* Live Date and Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151B23] border border-white/8 text-xs text-[#8B95A5]">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-white">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })}
          </span>
          <span className="text-white/20">|</span>
          <span className="text-xs">
            {currentTime.toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-[#151B23] border border-white/8 text-[#8B95A5] hover:text-white hover:border-white/20 transition cursor-pointer"
          title={`Current: ${theme} theme. Click to toggle to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode.`}
          aria-label="Toggle Theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                onMarkAllNotificationsRead();
              }
            }}
            className="p-2.5 rounded-xl bg-[#151B23] border border-white/8 text-[#8B95A5] hover:text-white hover:border-white/20 transition relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#151B23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#8B95A5]">
                    {notifications.length}
                  </span>
                </div>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                      title="Mark all as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Read all</span>
                    </button>
                    <button
                      onClick={onClearAllNotifications}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition ml-2"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8B95A5]">
                    No notifications yet. You're all clear!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 flex items-start gap-3 hover:bg-white/5 transition ${
                        !notif.read ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white/5 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#8B95A5] shrink-0 font-mono">
                            {notif.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#8B95A5] mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={() => onClearNotification(notif.id)}
                        className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#151B23] border border-white/8 hover:border-white/20 transition cursor-pointer"
            aria-label="User Account Menu"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white truncate max-w-[100px]">
                {user?.displayName || 'User'}
              </p>
              <p className="text-[10px] text-[#8B95A5]">
                {user?.isAnonymous ? 'Guest' : 'Admin'}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#151B23] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-medium text-white truncate">
                  {user?.displayName || 'Smart Home User'}
                </p>
                <p className="text-[10px] text-[#8B95A5] truncate">
                  {user?.email || 'Connected Device'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
