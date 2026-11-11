import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#151B23]/50 border border-white/5 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-[#8B95A5] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-medium text-white mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-[#8B95A5] max-w-sm mb-4">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
