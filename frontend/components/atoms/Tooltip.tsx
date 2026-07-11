import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactElement<{
    className?: string;
    onFocus?: React.FocusEventHandler;
    onBlur?: React.FocusEventHandler;
  }>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {React.cloneElement(children, {
        onFocus: showTooltip,
        onBlur: hideTooltip,
        className: `${children.props.className || ''} focus-visible-ring`.trim(),
      })}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap bg-neutral-900 text-neutral-50 text-xs px-2.5 py-1.5 rounded-small shadow-high border border-neutral-800 pointer-events-none transition-opacity duration-fast dark:bg-neutral-800 dark:border-neutral-700 ${positionClasses[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
