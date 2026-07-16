'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Ticket, ChevronRight, ArrowLeft } from 'lucide-react';

export default function FanHistory() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link href="/fan" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fan Portal</span>
          </Link>
          <span className="text-[10px] font-mono text-primary-500 font-bold uppercase tracking-wider">Attendance Log</span>
        </div>

        {/* Info card */}
        <div className="p-6 rounded-large border border-border-color bg-bg-card shadow-medium space-y-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Match Day Attendance History
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Your logged visits, entry tickets, and historical seating coordinates inside Solara Arena.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Match 1 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary">Solara FC vs United FC</h3>
                  <span className="text-[10px] text-text-muted block mt-0.5">July 16, 2026 • Gate A • Sec 104, Row 12</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>

            {/* Match 2 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-800 flex items-center justify-center text-text-muted shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary">Solara Derby (Cup Match)</h3>
                  <span className="text-[10px] text-text-muted block mt-0.5">June 28, 2026 • Gate B • Sec 202, Row 4</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
