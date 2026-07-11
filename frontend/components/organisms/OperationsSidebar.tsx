'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Map, AlertOctagon, Users, BarChart2, History } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export const OperationsSidebar: React.FC = () => {
  const pathname = usePathname();

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
      className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 h-screen sticky top-0 hidden md:flex flex-col justify-between p-4 select-none"
      aria-label="Operations Navigation Sidebar"
    >
      <div className="space-y-6">
        {/* Brand header branding */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-6 w-6 rounded bg-primary-600 flex items-center justify-center font-bold text-white text-sm">
            Ω
          </div>
          <span className="font-extrabold text-sm text-zinc-100 tracking-wider">
            ARENAMIND
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-medium text-xs font-semibold tracking-wide transition-all focus-visible-ring
                  ${isActive ? 'bg-zinc-900 text-primary-400 border border-zinc-800' : 'hover:bg-zinc-900/50 hover:text-zinc-100 text-zinc-400 border border-transparent'}`}
              >
                <IconWrapper icon={item.icon} size="sm" className={isActive ? 'text-primary-400' : 'text-zinc-500'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-zinc-800 pt-4 px-2 text-[10px] text-zinc-500 font-mono flex flex-col gap-0.5">
        <span>ArenaMind Platform</span>
        <span>Version 0.1.0-scaffold</span>
      </div>
    </aside>
  );
};
