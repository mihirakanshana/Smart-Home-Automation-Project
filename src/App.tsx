/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCurrentSensors } from './hooks/useCurrentSensors';
import { useDeviceState } from './hooks/useDeviceState';
import { useSystemStatus } from './hooks/useSystemStatus';
import { useSensorHistory } from './hooks/useSensorHistory';
import { useNotifications } from './hooks/useNotifications';

import { ActiveTab } from './types';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { CriticalAlertBanner } from './components/Layout/CriticalAlertBanner';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { DevicesView } from './components/Devices/DevicesView';
import { SecurityView } from './components/Security/SecurityView';
import { AlertsView } from './components/Alerts/AlertsView';
import { VoiceControlCenter } from './components/Voice/VoiceControlCenter';
import { SettingsView } from './components/Settings/SettingsView';
import { LoginPage } from './components/Auth/LoginPage';
import { Toast } from './components/Common/Toast';
import { WifiOff, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 1. Auth Hook
  const {
    user,
    loading: authLoading,
    error: authError,
    login,
    signup,
    loginGuest,
    logout,
    resetPassword,
    clearError: clearAuthError,
  } = useAuth();

  // 2. Real-time Firebase RTDB Hooks
  const { sensors, loading: loadingSensors } = useCurrentSensors();
  const {
    devices,
    loading: loadingDevices,
    pendingDevice,
    actionFeedback,
    toggleDevice,
    clearFeedback,
  } = useDeviceState();
  const { status: systemStatus, firebaseOnline, isReconnecting } = useSystemStatus();
  const {
    readings: historicalReadings,
    loading: loadingHistory,
    summary,
    rainAnalytics,
  } = useSensorHistory();

  // 3. Real-time Notifications Hook
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications(sensors, systemStatus);

  // If checking authentication state on initial load
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#8B95A5] font-medium tracking-wide">
          Connecting to Smart Home Firebase Engine...
        </p>
      </div>
    );
  }

  // If user is not authenticated, show Login / Auth page
  if (!user) {
    return (
      <LoginPage
        onLogin={login}
        onSignup={signup}
        onGuestLogin={loginGuest}
        onResetPassword={resetPassword}
        error={authError}
        onClearError={clearAuthError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Offline / Reconnecting Non-Blocking Banner */}
      {isReconnecting && (
        <div className="w-full bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md z-50">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Connection lost. Reconnecting to Firebase Realtime Database...</span>
        </div>
      )}

      {/* Global Critical Alert Banner for Fire & Gas Danger */}
      <CriticalAlertBanner sensors={sensors} onNavigate={setActiveTab} />

      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          systemStatus={systemStatus}
          firebaseOnline={firebaseOnline}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Sticky Header */}
          <Navbar
            activeTab={activeTab}
            user={user}
            systemStatus={systemStatus}
            firebaseOnline={firebaseOnline}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllNotificationsRead={markAllAsRead}
            onClearNotification={clearNotification}
            onClearAllNotifications={clearAll}
            onLogout={logout}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Body Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                sensors={sensors}
                devices={devices}
                systemStatus={systemStatus}
                firebaseOnline={firebaseOnline}
                historicalReadings={historicalReadings}
                loadingSensors={loadingSensors}
                loadingHistory={loadingHistory}
                pendingDevice={pendingDevice}
                onToggleDevice={toggleDevice}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                sensors={sensors}
                readings={historicalReadings}
                summary={summary}
                rainAnalytics={rainAnalytics}
                loading={loadingHistory}
              />
            )}

            {activeTab === 'devices' && (
              <DevicesView
                devices={devices}
                pendingDevice={pendingDevice}
                onToggleDevice={toggleDevice}
              />
            )}

            {activeTab === 'security' && (
              <SecurityView
                sensors={sensors}
                devices={devices}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView sensors={sensors} devices={devices} />
            )}

            {activeTab === 'voice' && <VoiceControlCenter />}

            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                systemStatus={systemStatus}
                firebaseOnline={firebaseOnline}
              />
            )}
          </main>
        </div>
      </div>

      {/* Floating Action Feedback Toast */}
      {actionFeedback && (
        <Toast
          message={actionFeedback.message}
          type={actionFeedback.type}
          onClose={clearFeedback}
        />
      )}
    </div>
  );
}
