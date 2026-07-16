import React from 'react';
import { Cloud, Train, DoorOpen, Activity, Users, AlertTriangle, HelpCircle, LucideIcon } from 'lucide-react';
import { Chip } from '../atoms/Chip';
import { IconWrapper } from '../atoms/IconWrapper';

export interface EvidenceChipProps {
  label: string;
  category: string;
  className?: string;
}

/*
 * EvidenceChip — Phase 5A Visual Overhaul
 *
 * Previous: primary-50/primary-900 backgrounds in light/dark — looked generic.
 * Now: each category gets a distinct hue-tinted treatment, giving visual identity
 * to different evidence types at a glance:
 *   weather    → blue-cyan tint (sky/atmosphere)
 *   transport  → purple-violet tint (transit/mobility)
 *   gates      → emerald tint (entry/operational flow)
 *   medical    → red-rose tint (health/urgency)
 *   volunteers → amber-warm tint (people/assistance)
 *   incidents  → orange tint (alerts/events)
 *
 * All use semi-transparent backgrounds consistent with the dark surface system.
 * Icon colors match the tint for immediate visual scanning in Judge Portal tables.
 */
export const EvidenceChip: React.FC<EvidenceChipProps> = ({ label, category, className = '' }) => {
  const iconMap: Record<string, LucideIcon> = {
    weather:    Cloud,
    transport:  Train,
    gates:      DoorOpen,
    medical:    Activity,
    volunteers: Users,
    incidents:  AlertTriangle,
  };

  type CategoryStyle = {
    chip: string;
    icon: string;
  };

  const categoryStyles: Record<string, CategoryStyle> = {
    weather: {
      chip: 'bg-[rgba(56,189,248,0.10)] border-[rgba(56,189,248,0.22)] text-[#7dd3fc]',
      icon: 'text-[#38bdf8]',
    },
    transport: {
      chip: 'bg-[rgba(167,139,250,0.10)] border-[rgba(167,139,250,0.22)] text-[#c4b5fd]',
      icon: 'text-[#a78bfa]',
    },
    gates: {
      chip: 'bg-[rgba(52,211,153,0.10)] border-[rgba(52,211,153,0.22)] text-[#6ee7b7]',
      icon: 'text-[#34d399]',
    },
    medical: {
      chip: 'bg-[rgba(251,113,133,0.10)] border-[rgba(251,113,133,0.22)] text-[#fda4af]',
      icon: 'text-[#fb7185]',
    },
    volunteers: {
      chip: 'bg-[rgba(251,191,36,0.10)] border-[rgba(251,191,36,0.22)] text-[#fde68a]',
      icon: 'text-[#fbbf24]',
    },
    incidents: {
      chip: 'bg-[rgba(249,115,22,0.10)] border-[rgba(249,115,22,0.22)] text-[#fdba74]',
      icon: 'text-[#f97316]',
    },
  };

  const IconComponent = iconMap[category.toLowerCase()] || HelpCircle;
  const style = categoryStyles[category.toLowerCase()] || {
    chip: 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.10)] text-text-secondary',
    icon: 'text-text-muted',
  };

  return (
    <Chip
      label={label}
      icon={<IconWrapper icon={IconComponent} size="sm" className={style.icon} />}
      className={`${style.chip} ${className}`}
    />
  );
};
