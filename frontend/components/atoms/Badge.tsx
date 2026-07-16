import React from 'react';
import { Severity } from '../../types';

export interface BadgeProps {
  variant?: Severity | 'neutral' | 'primary';
  children: React.ReactNode;
  className?: string;
}

/*
 * Badge — Phase 5A Visual Overhaul
 *
 * Previous: flat background fills with generic Tailwind color classes.
 * Now: semi-transparent tinted backgrounds + matching colored borders + correct
 * text colors verified for WCAG AA on dark elevation surfaces.
 *
 * Each variant uses the CSS custom property status colors defined in globals.css,
 * which are hue-distinct (emerald / amber / orange / red) rather than
 * traffic-light monotone. Glow is reserved for the parent container via .glow-*
 * utility classes — not on the badge itself (avoids visual noise).
 */
export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const baseStyle =
    'inline-flex items-center px-2 py-0.5 rounded-small text-[11px] font-semibold font-sans tracking-wide select-none border leading-tight';

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    /* LOW / NORMAL — Emerald-tinted, operational calm */
    normal: [
      'bg-[rgba(16,185,129,0.12)]',
      'border-[rgba(16,185,129,0.30)]',
      'text-[#6ee7b7]',
    ].join(' '),

    /* PRIMARY — Indigo-tinted, branding/informational */
    primary: [
      'bg-[rgba(99,102,241,0.14)]',
      'border-[rgba(99,102,241,0.30)]',
      'text-[#818cf8]',
    ].join(' '),

    /* WARNING / MODERATE — Amber-tinted, attention */
    warning: [
      'bg-[rgba(245,158,11,0.12)]',
      'border-[rgba(245,158,11,0.30)]',
      'text-[#fcd34d]',
    ].join(' '),

    /* CRITICAL — Red-tinted, highest urgency */
    critical: [
      'bg-[rgba(239,68,68,0.15)]',
      'border-[rgba(239,68,68,0.40)]',
      'text-[#f87171]',
    ].join(' '),

    /* RESOLVED — Emerald-tinted, positive/success state */
    resolved: [
      'bg-[rgba(16,185,129,0.10)]',
      'border-[rgba(16,185,129,0.25)]',
      'text-[#34d399]',
    ].join(' '),

    /* NEUTRAL — Muted, de-emphasized metadata */
    neutral: [
      'bg-[rgba(255,255,255,0.06)]',
      'border-[rgba(255,255,255,0.10)]',
      'text-[#9090a8]',
    ].join(' '),
  };

  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
