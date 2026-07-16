'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Map, AlertOctagon, Users, BarChart2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export const OperationsSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const navItems = [
    { label: 'Overview', href: '/operations', icon: LayoutDashboard },
    { label: 'Live Decisions', href: '/operations/decisions', icon: FileText },
    { label: 'Stadium Twin', href: '/operations/stadium-twin', icon: Map },
    { label: 'Incident Center', href: '/operations/incidents', icon: AlertOctagon },
    { label: 'Volunteers', href: '/operations/volunteers', icon: Users },
    { label: 'AI Insights', href: '/operations/insights', icon: BarChart2 },
    { label: 'History Log', href: '/operations/history', icon: History },
  ];

  return (
    <aside
      className={`bg-zinc-950 border-r border-zinc-800 text-zinc-300 h-screen sticky top-0 hidden md:flex flex-col justify-between p-4 select-none transition-all duration-medium z-30
        ${isExpanded ? 'w-64' : 'w-20'}`}
      aria-label="Operations Navigation Sidebar"
    >
      <div className="space-y-6">
        {/* Brand header branding */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-6 w-6 rounded bg-primary-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              Ω
            </div>
            {isExpanded && (
              <span className="font-extrabold text-sm text-zinc-100 tracking-wider transition-opacity duration-fast">
                ARENAMIND
              </span>
            )}
          </div>
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 focus:outline-none"
            aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <IconWrapper icon={isExpanded ? ChevronLeft : ChevronRight} size="sm" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-medium text-xs font-semibold tracking-wide transition-all focus-visible-ring
                  ${isActive ? 'bg-zinc-900 text-primary-400 border border-zinc-800' : 'hover:bg-zinc-900/50 hover:text-zinc-100 text-zinc-400 border border-transparent'}
                  ${!isExpanded ? 'justify-center px-0' : ''}`}
              >
                <IconWrapper icon={item.icon} size="sm" className={isActive ? 'text-primary-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                {isExpanded && <span className="transition-opacity duration-fast">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-zinc-800 pt-4 px-2 text-[10px] text-zinc-500 font-mono flex flex-col gap-0.5 overflow-hidden">
        {isExpanded ? (
          <>
            <span>ArenaMind Platform</span>
            <span>Version 0.1.0-scaffold</span>
          </>
        ) : (
          <span className="text-center">v0.1</span>
        )}
      </div>
    </aside>
  );
};
