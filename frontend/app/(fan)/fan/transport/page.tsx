'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Train, MapPin, ArrowLeft } from 'lucide-react';

export default function FanTransport() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link href="/fan" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fan Portal</span>
          </Link>
          <span className="text-[10px] font-mono text-primary-500 font-bold uppercase tracking-wider">Transit & Parking</span>
        </div>

        {/* Info card */}
        <div className="p-6 rounded-large border border-border-color bg-bg-card shadow-medium space-y-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Solara Arena Public Transit Status
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Live updates on shuttles, regional light rail lines, and general stadium parking lot vacancy.
            </p>
          </div>

          <div className="space-y-4">
            {/* Transit Method 1 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex gap-3.5">
              <div className="h-8 w-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0">
                <Train className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-text-primary">Metro Line S1 (Express)</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/50">ON SCHEDULE</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  Departs every 6 minutes from Solara Central Station. Directly drops off at West Entrance Gate G.
                </p>
              </div>
            </div>

            {/* Transit Method 2 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex gap-3.5">
              <div className="h-8 w-8 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-400 shrink-0">
                <Bus className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-text-primary">Shuttle Loop B (North/East Lot)</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/50">ACTIVE</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  Loop shuttle connecting North Parking A & B to East Entrance Gate C. High frequency service is active.
                </p>
              </div>
            </div>

            {/* Parking space availability */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color space-y-2">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  Parking Deck Alpha Vacancy
                </h4>
                <span className="font-mono font-bold text-text-secondary">420/1200 open</span>
              </div>
              <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden border border-border-color">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
