'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FanNavigate() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link href="/fan" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fan Portal</span>
          </Link>
          <span className="text-[10px] font-mono text-primary-500 font-bold uppercase tracking-wider">Navigation Guide</span>
        </div>

        {/* Info card */}
        <div className="p-6 rounded-large border border-border-color bg-bg-card shadow-medium space-y-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Arena Navigation Wayfinder
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Find shortest routes to seats, concessions, lounges, and exits based on live foot-traffic sensors.
            </p>
          </div>

          <div className="space-y-4">
            {/* Sector Finder input block */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color space-y-3">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary-500" />
                Find Seat Section Route
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Section Number (e.g. 104)"
                  className="flex-1 bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500 text-text-primary"
                  disabled
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/10">
                  Search
                </button>
              </div>
            </div>

            {/* Quick directions */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Suggested Gate Routing</span>
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-text-primary">Concessions Plaza</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">Estimated 1 min walk from North Stand (Gate A)</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary-400">
                  <span>Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
