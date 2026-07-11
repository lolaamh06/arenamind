import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

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
      <div className="absolute left-3 pointer-events-none text-text-muted">
        <IconWrapper icon={Search} size="sm" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 text-sm bg-bg-primary border border-border-color rounded-medium text-text-primary placeholder-text-muted focus-visible-ring transition-colors duration-fast"
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-text-muted hover:text-text-primary focus-visible-ring"
        >
          <IconWrapper icon={X} size="sm" />
        </button>
      )}
    </div>
  );
};
