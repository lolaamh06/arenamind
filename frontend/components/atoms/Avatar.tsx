import React from 'react';

export interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full bg-neutral-200 text-neutral-700 text-xs font-semibold select-none overflow-hidden border border-border-color dark:bg-neutral-800 dark:text-neutral-200 ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
