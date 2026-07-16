'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Eye, Ear, ArrowLeft } from 'lucide-react';

export default function FanAccessibility() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link href="/fan" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fan Portal</span>
          </Link>
          <span className="text-[10px] font-mono text-primary-500 font-bold uppercase tracking-wider">Accessibility</span>
        </div>

        {/* Info card */}
        <div className="p-6 rounded-large border border-border-color bg-bg-card shadow-medium space-y-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Accessibility Services
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Solara Arena is fully inclusive. Access live navigation help, assistive audio feeds, or request field-level staff escorts.
            </p>
          </div>

          <div className="space-y-4">
            {/* Service 1 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex gap-3.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary">Step-Free Entry & Ramps</h3>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                  Available at <strong className="text-text-primary">Gate A</strong> and <strong className="text-text-primary">Gate E</strong>. Follow sensory signs or request a wheelchair companion dispatch.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex gap-3.5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary">Audio Description Stream</h3>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                  Headphone streams are broadcasted on channel <strong className="text-text-primary">FM 88.4</strong>. Captures play-by-play descriptions of match events for visually impaired spectators.
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-color flex gap-3.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <Ear className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary">Closed Captions Feed</h3>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                  Select screen descriptors are available on the Arena App. Live speech-to-text translations are broadcasted to section monitors.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
