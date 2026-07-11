import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ComponentSize } from '../../types';

export interface IconWrapperProps {
  icon: LucideIcon;
  size?: ComponentSize;
  className?: string;
  ariaHidden?: boolean;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  size = 'md',
  className = '',
  ariaHidden = true,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return <Icon className={`${sizeClasses[size]} ${className}`} aria-hidden={ariaHidden} />;
};
