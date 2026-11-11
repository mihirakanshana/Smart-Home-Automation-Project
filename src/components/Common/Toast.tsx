import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-rose-950/90 border-rose-500/30 text-rose-200';
      case 'info':
        return 'bg-sky-950/90 border-sky-500/30 text-sky-200';
      case 'success':
      default:
        return 'bg-[#151B23]/95 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'info':
        return <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${getStyles()}`}
    >
      {getIcon()}
      <span className="text-xs font-medium tracking-wide">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
