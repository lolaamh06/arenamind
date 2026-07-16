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

/*
 * Tooltip — Phase 5A Visual Overhaul
 *
 * Previous: neutral-900 solid fill — flat, heavy.
 * Now: glass/blur surface recipe — semi-transparent bg-card color with
 *   backdrop-blur and white-tinted border. Matches the "floating overlay"
 *   glassmorphism pattern (reserved for overlapping/floating contexts per
 *   the research — tooltip is exactly that use case).
 *
 * Text uses font-mono for technical tooltips, but since we can't know the
 * content type here, we keep font-sans with slightly tracked size.
 * Shadow: shadow-xl (deepest) to ensure tooltip reads above all surfaces.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
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
        onBlur:  hideTooltip,
        className: `${children.props.className || ''} focus-visible-ring`.trim(),
      })}
      {isVisible && (
        <div
          role="tooltip"
          className={[
            'absolute z-50 whitespace-nowrap pointer-events-none',
            'px-2.5 py-1.5 rounded-medium text-xs font-medium text-text-primary',
            'bg-[rgba(28,28,46,0.85)] backdrop-blur-md',
            'border border-[rgba(255,255,255,0.12)]',
            'shadow-[0_8px_24px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.4)]',
            'transition-opacity duration-fast',
            positionClasses[position],
          ].join(' ')}
        >
          {content}
        </div>
      )}
    </div>
  );
};
