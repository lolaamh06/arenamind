'use client';

import React from 'react';
import Link from 'next/link';
import { useStadiumState } from '../context/StadiumStateContext';
import { ArrowRight, LayoutDashboard, Smartphone, Scale, Cloud } from 'lucide-react';
import { IconWrapper } from '../components/atoms/IconWrapper';
import { StadiumTwinDiagram } from '../components/organisms/StadiumTwinDiagram';

export default function Home() {
  const { stadiumContext, isLoadingContext } = useStadiumState();

  const metadata = stadiumContext?.metadata;
  const weather = stadiumContext?.weather;

  return (
    <main className="flex min-h-screen flex-col bg-bg-base text-text-primary font-sans selection:bg-primary-600 selection:text-white">
      {/* Premium Gradient Background Glow */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex-1 flex flex-col items-center justify-between max-w-6xl w-full mx-auto px-6 py-12 md:py-16 gap-8 z-10">
        
        {/* Top Header/Logo */}
        <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-primary-500/20">
              Ω
            </div>
            <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
              ARENAMIND
            </span>
          </div>
          <div className="px-3 py-1 rounded-full border border-border-color bg-bg-card/50 text-[10px] font-mono tracking-widest text-text-secondary uppercase select-none text-center">
            Platform Portal v0.2.0
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full my-auto text-left">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
              One Truth.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                Many Perspectives.
              </span>
            </h1>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              The real-time Digital Stadium Twin and AI Decision Intelligence engine that keeps matches safe, smooth, and predictable.
            </p>

            {/* Live Twin Snapshot Strip */}
            <div className="pt-2">
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 px-6 py-3 rounded-2xl bg-bg-card/40 border border-border-color backdrop-blur-md text-xs font-medium text-text-secondary">
                {isLoadingContext || !metadata ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary-500 animate-ping" />
                    Synchronizing Twin State...
                  </span>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-text-primary">{metadata.name}</span>
                    </div>
                    <div className="h-4 w-px bg-border-color hidden sm:block" />
                    <div className="w-full sm:w-auto">
                      Match Phase: <span className="font-semibold text-text-primary capitalize">{metadata.matchPhase.replace('-', ' ')}</span>
                    </div>
                    <div className="h-4 w-px bg-border-color hidden sm:block" />
                    <div className="w-full sm:w-auto">
                      Attendance: <span className="font-semibold text-text-primary">{metadata.currentAttendance.toLocaleString()}</span>
                    </div>
                    {weather && (
                      <>
                        <div className="h-4 w-px bg-border-color hidden sm:block" />
                        <div className="flex items-center justify-center gap-1.5 capitalize w-full sm:w-auto">
                          <IconWrapper icon={Cloud} size="sm" className="text-text-muted" />
                          <span>{weather.condition.replace('-', ' ')}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stadium Twin 3D View on Right side */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <StadiumTwinDiagram
              stadiumContext={stadiumContext}
              variant="simple"
            />
          </div>
        </section>

        {/* Portal Entry Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-auto">
          {/* Card 1: Operations Portal */}
          <Link
            href="/operations"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-bg-card/30 hover:bg-bg-card/60 border border-border-color/40 hover:border-border-color transition-all duration-medium hover:shadow-2xl hover:shadow-primary-950/20"
          >
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-2xl bg-primary-900/30 text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconWrapper icon={LayoutDashboard} size="md" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-400 transition-colors">
                  Operations Control
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Real-time monitoring console for stadium operators. Direct queues, coordinate staff, and act on AI incident recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted group-hover:text-text-secondary transition-colors pt-6">
              <span>Access Control Room</span>
              <IconWrapper icon={ArrowRight} size="sm" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Fan Experience */}
          <Link
            href="/fan"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-bg-card/30 hover:bg-bg-card/60 border border-border-color/40 hover:border-border-color transition-all duration-medium hover:shadow-2xl hover:shadow-secondary-950/20"
          >
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary-900/30 text-secondary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconWrapper icon={Smartphone} size="md" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-secondary-400 transition-colors">
                  Spectator Portal
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Mobile-first guide for spectators. Live match score, queue advisories, concession stand statuses, and reassurances.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted group-hover:text-text-secondary transition-colors pt-6">
              <span>Open Mobile Web App</span>
              <IconWrapper icon={ArrowRight} size="sm" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Judge Portal */}
          <Link
            href="/judge"
            className="group flex flex-col justify-between p-6 rounded-3xl bg-bg-card/30 hover:bg-bg-card/60 border border-border-color/40 hover:border-border-color transition-all duration-medium hover:shadow-2xl hover:shadow-amber-950/10"
          >
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-900/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconWrapper icon={Scale} size="md" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-amber-400 transition-colors">
                  Judge Experience
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Explainable AI (XAI) auditor board. Inspect prompt templates, signal filters, raw responses, and decision-making logic.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted group-hover:text-text-secondary transition-colors pt-6">
              <span>Launch Auditor Console</span>
              <IconWrapper icon={ArrowRight} size="sm" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>

        {/* Footer */}
        <footer className="w-full text-center text-[10px] text-text-muted font-mono mt-8 select-none">
          © 2026 ArenaMind Decision Systems. Distributed under Demo License.
        </footer>
      </div>
    </main>
  );
}
