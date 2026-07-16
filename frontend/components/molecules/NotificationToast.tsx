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

/*
 * NotificationToast — Phase 5A Visual Overhaul
 *
 * Previous: border-border-color on bg-bg-card — looked like a regular card.
 * Now: glass surface (same floating context pattern as Tooltip) + left-side
 *   colored accent stripe that signals severity at a glance (F1 UI pattern:
 *   left border accent color for status/severity identification).
 *
 * The icon gets a small tinted container rather than just floating text.
 * Dismiss button uses rounded-full hover consistent with other button patterns.
 * Shadow uses shadow-xl so it reads above all page layers.
 */
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
    info: {
      icon:        Info,
      iconColor:   'text-[#818cf8]',
      iconBg:      'bg-[rgba(99,102,241,0.12)]',
      accentColor: '#6366f1',
    },
    success: {
      icon:        CheckCircle,
      iconColor:   'text-[#34d399]',
      iconBg:      'bg-[rgba(16,185,129,0.12)]',
      accentColor: '#10b981',
    },
    error: {
      icon:        AlertCircle,
      iconColor:   'text-[#f87171]',
      iconBg:      'bg-[rgba(239,68,68,0.12)]',
      accentColor: '#ef4444',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-3 p-3 pr-4 rounded-large max-w-sm',
        'bg-[rgba(28,28,46,0.90)] backdrop-blur-xl',
        'border border-[rgba(255,255,255,0.10)]',
        'shadow-[0_16px_40px_rgba(0,0,0,0.7),0_8px_16px_rgba(0,0,0,0.4)]',
        'transition-all duration-fast overflow-hidden',
        className,
      ].join(' ')}
      style={{
        /* Left accent stripe — severity identification at a glance */
        borderLeft: `3px solid ${config.accentColor}`,
      }}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-medium flex items-center justify-center ${config.iconBg}`}
      >
        <IconWrapper icon={config.icon} size="sm" className={config.iconColor} />
      </div>

      {/* Message */}
      <p className="text-xs font-medium text-text-primary grow leading-snug">
        {message}
      </p>

      {/* Dismiss */}
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className={[
          'flex-shrink-0 ml-1 p-1 rounded-full',
          'text-text-muted hover:text-text-primary',
          'hover:bg-[rgba(255,255,255,0.08)]',
          'transition-colors duration-fast focus-visible-ring',
        ].join(' ')}
      >
        <IconWrapper icon={X} size="sm" />
      </button>
    </div>
  );
};
