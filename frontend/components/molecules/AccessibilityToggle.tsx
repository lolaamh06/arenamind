import React from 'react';
import { Eye, Type } from 'lucide-react';
import { Toggle } from '../atoms/Toggle';
import { IconWrapper } from '../atoms/IconWrapper';

export interface AccessibilityToggleProps {
  isHighContrast: boolean;
  onHighContrastChange: (checked: boolean) => void;
  isLargeFont: boolean;
  onLargeFontChange: (checked: boolean) => void;
  className?: string;
}

export const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({
  isHighContrast,
  onHighContrastChange,
  isLargeFont,
  onLargeFontChange,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-3 p-3 bg-bg-secondary border border-border-color rounded-medium shadow-low select-none ${className}`}
      aria-label="Accessibility Settings"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-text-secondary">
          <IconWrapper icon={Eye} size="sm" />
          <span className="text-xs font-medium">High Contrast</span>
        </div>
        <Toggle checked={isHighContrast} onChange={onHighContrastChange} />
      </div>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-text-secondary">
          <IconWrapper icon={Type} size="sm" />
          <span className="text-xs font-medium">Larger Text</span>
        </div>
        <Toggle checked={isLargeFont} onChange={onLargeFontChange} />
      </div>
    </div>
  );
};
