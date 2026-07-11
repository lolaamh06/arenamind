import React from 'react';

export interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  children,
  className = '',
}) => {
  return (
    <div className={`min-h-screen flex w-full bg-bg-primary text-text-primary ${className}`}>
      {/* Persistent Left Sidebar Navigation */}
      {sidebar}

      {/* Main Scrollable Content Viewport */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
