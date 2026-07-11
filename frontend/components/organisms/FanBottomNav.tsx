'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Navigation, MessageSquare, History, Settings } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export const FanBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/fan', icon: Home },
    { label: 'Navigate', href: '/fan/navigate', icon: Navigation },
    { label: 'Assistant', href: '/fan/assistant', icon: MessageSquare },
    { label: 'History', href: '/fan/history', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card border-t border-border-color shadow-high block md:hidden select-none"
      aria-label="Fan navigation bar"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center grow h-full gap-1 transition-colors duration-fast focus-visible-ring
                ${isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <IconWrapper icon={item.icon} size="sm" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
