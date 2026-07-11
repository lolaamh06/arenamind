import React, { useId } from 'react';
import { Globe } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface Language {
  code: string;
  name: string;
}

export interface LanguageSelectorProps {
  currentLanguage: string;
  languages?: Language[];
  onChange: (code: string) => void;
  className?: string;
}

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  languages = DEFAULT_LANGUAGES,
  onChange,
  className = '',
}) => {
  const id = useId();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
        <IconWrapper icon={Globe} size="sm" />
        <span className="sr-only">Select Language</span>
      </label>
      <select
        id={id}
        value={currentLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 bg-bg-primary border border-border-color text-xs rounded-medium text-text-primary focus-visible-ring cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
