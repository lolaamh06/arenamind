import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast ease-in-out focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-800'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-low ring-0 transition duration-fast ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-text-primary">
          {label}
        </span>
      )}
    </div>
  );
};
