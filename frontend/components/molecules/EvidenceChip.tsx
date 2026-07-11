import React from 'react';
import { Cloud, Train, DoorOpen, Activity, Users, AlertTriangle, HelpCircle, LucideIcon } from 'lucide-react';
import { Chip } from '../atoms/Chip';
import { IconWrapper } from '../atoms/IconWrapper';

export interface EvidenceChipProps {
  label: string;
  category: string;
  className?: string;
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({ label, category, className = '' }) => {
  // Map categories to Lucide icon components
  const iconMap: Record<string, LucideIcon> = {
    weather: Cloud,
    transport: Train,
    gates: DoorOpen,
    medical: Activity,
    volunteers: Users,
    incidents: AlertTriangle,
  };

  const IconComponent = iconMap[category.toLowerCase()] || HelpCircle;

  return (
    <Chip
      label={label}
      icon={<IconWrapper icon={IconComponent} size="sm" />}
      className={`border-primary-100 bg-primary-50/30 text-primary-900 dark:border-primary-900/30 dark:bg-primary-900/10 dark:text-primary-300 ${className}`}
    />
  );
};
