import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 ${className}`}>
      {children}
    </div>
  );
};
