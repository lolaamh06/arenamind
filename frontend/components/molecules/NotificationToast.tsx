import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface NotificationToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  duration?: number; // In ms, default 3000
  onClose: () => void;
  className?: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  className = '',
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    info: { icon: Info, color: 'text-primary-500 bg-primary-50 border-primary-100 dark:bg-primary-950/20' },
    success: { icon: CheckCircle, color: 'text-secondary-500 bg-secondary-50 border-secondary-100 dark:bg-secondary-950/20' },
    error: { icon: AlertCircle, color: 'text-critical-500 bg-critical-50 border-critical-100 dark:bg-critical-950/20' },
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-3 rounded-medium border shadow-high bg-bg-card max-w-sm border-border-color transition-all duration-fast ${className}`}
    >
      <div className="flex-shrink-0">
        <IconWrapper icon={typeConfig[type].icon} size="md" className={typeConfig[type].color} />
      </div>
      <p className="text-xs font-medium text-text-primary grow pr-4">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-text-muted hover:text-text-primary p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible-ring"
      >
        <IconWrapper icon={X} size="sm" />
      </button>
    </div>
  );
};
