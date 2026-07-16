import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/*
 * SearchBar — Phase 5A Visual Overhaul
 *
 * Previous: bg-bg-primary border-border-color — blends into the page, no depth.
 * Now: bg-bg-secondary (recessed, one step below card surface) + the new
 *   rgba white-tinted border system. Focus adds the indigo glow ring matching
 *   the Input atom pattern — visual consistency across all text inputs.
 *
 * Clear button uses rounded-full with rgba hover instead of neutral-100/800.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <div className="absolute left-3 pointer-events-none text-text-muted z-10">
        <IconWrapper icon={Search} size="sm" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'w-full pl-9 pr-9 py-2 text-sm font-sans',
          'bg-bg-secondary text-text-primary',
          'border border-[rgba(255,255,255,0.10)] rounded-medium',
          'placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60',
          'hover:border-[rgba(255,255,255,0.18)]',
          'transition-all duration-fast',
        ].join(' ')}
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className={[
            'absolute right-3 p-0.5 rounded-full',
            'hover:bg-[rgba(255,255,255,0.10)]',
            'text-text-muted hover:text-text-primary',
            'transition-colors duration-fast focus-visible-ring',
          ].join(' ')}
        >
          <IconWrapper icon={X} size="sm" />
        </button>
      )}
    </div>
  );
};
