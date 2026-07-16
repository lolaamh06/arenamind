'use client';

import React, { useState } from 'react';
import { useStadiumState } from '../../../context/StadiumStateContext';
import { FanAdvisoryBanner } from '../../../components/organisms/FanAdvisoryBanner';
import { AccessibilityFinder } from '../../../components/organisms/AccessibilityFinder';
import { StadiumTwinDiagram } from '../../../components/organisms/StadiumTwinDiagram';
import { MatchInfoCard } from '../../../components/organisms/MatchInfoCard';
import { AmenitiesFinder } from '../../../components/organisms/AmenitiesFinder';
import { MatchHighlightsFeed } from '../../../components/organisms/MatchHighlightsFeed';
import { LivePollWidget } from '../../../components/organisms/LivePollWidget';
import { translateGateRisk, translateWeather } from '../../../lib/fan-language';
import { RefreshCw, MapPin, CloudSun, Sparkles } from 'lucide-react';
import { IconWrapper } from '../../../components/atoms/IconWrapper';

export default function FanHome() {
  const { stadiumContext, currentDecisionBrief, isLoadingContext } = useStadiumState();

  const [selectedGateId, setSelectedGateId] = useState<string>('gate-a');

  // Hard exclusion check: Incident records, medical telemetry data objects, and volunteer lists are prohibited.
  const gates = stadiumContext?.gates || [];
  const activeGate = gates.find((g) => g.id === selectedGateId);
  const metadata = stadiumContext?.metadata;
  const weather = stadiumContext?.weather;
  const accessibilityAssets = stadiumContext?.accessibilityAssets || [];
  const matchInfo = stadiumContext?.matchInfo || null;
  const amenities = stadiumContext?.amenities || [];

  const handleGateClick = (gateId: string) => {
    setSelectedGateId(gateId);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary select-none flex flex-col items-center">
      {/* Outer wrapper to contain correctly */}
      <div className="w-full flex flex-col min-h-screen">
        {/* Max width container that wraps the responsive layouts */}
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-1 px-4 py-6 md:px-6">
          {/* Welcome Status Banner Header */}
          <header className="p-5 border border-border-color bg-bg-card rounded-large bg-gradient-to-b from-primary-600/5 to-transparent shrink-0 mb-6 flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-primary-600 dark:text-primary-400 uppercase">
                Welcome to Solara Arena
              </span>
              <h1 className="text-base font-black tracking-tight text-text-primary mt-0.5">
                {metadata?.matchName || 'Match Day'}
              </h1>
              <p className="text-[10px] text-text-secondary mt-0.5 font-medium">
                Live State: <span className="font-bold text-primary-600 dark:text-primary-400 capitalize">{metadata?.matchPhase.replace('-', ' ') || 'Pre-match'}</span>
              </p>
            </div>
            {isLoadingContext && (
              <IconWrapper icon={RefreshCw} size="sm" className="text-primary-500 animate-spin" />
            )}
          </header>

          {/* MAIN RESPONSIVE GRID LAYOUTS */}
          {/* Mobile view (<768px): single column grid/flex */}
          {/* Tablet view (768px to 1024px): 2-columns (MatchInfo+Map side by side, Advisory full width, status full, Amenities+Access side by side, Poll+Highlights side by side) */}
          {/* Desktop view (1024px+): 2-columns. Left: MatchInfo, Map, Gate Status, Advisory (sticky). Right: Amenities, Access, Engagement (Poll, Highlights) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
            {/* DESKTOP VIEW LAYOUT (1024px+) */}
            {/* Left sticky pane: Match Info -> Map -> Gate Status -> Advisory */}
            <div className="col-span-5 space-y-6 lg:sticky lg:top-20">
              <MatchInfoCard
                matchInfo={matchInfo}
                homeTeam={metadata?.homeTeam}
                awayTeam={metadata?.awayTeam}
                matchPhase={metadata?.matchPhase}
              />

              <StadiumTwinDiagram
                stadiumContext={stadiumContext}
                selectedGateId={selectedGateId}
                onGateClick={handleGateClick}
                variant="simple"
              />

              <section className="p-4 bg-bg-card border border-border-color rounded-large shadow-low flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-text-primary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    Gate Entry Status
                  </h3>
                  <select
                    value={selectedGateId}
                    onChange={(e) => setSelectedGateId(e.target.value)}
                    className="text-[11px] font-semibold bg-bg-secondary border border-border-color/60 rounded px-2 py-1 focus:outline-none"
                  >
                    {gates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.displayName.split('—')[0].trim()}
                      </option>
                    ))}
                  </select>
                </div>

                {activeGate ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-bg-secondary/40 border border-border-color/30 rounded-medium text-center space-y-1">
                      <div className="text-sm font-extrabold text-text-primary">
                        {translateGateRisk(activeGate.riskLevel)}
                      </div>
                      <div className="text-[10px] text-text-muted font-medium">
                        Typical queue time: ~{activeGate.queueEstimate} minutes
                      </div>
                    </div>

                    <div className="space-y-1 font-mono text-[9px] text-text-muted">
                      <div className="flex justify-between">
                        <span>Gate Volume Capacity</span>
                        <span className="font-bold">{activeGate.occupancyPercent}% full</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden border border-border-color/30">
                        <div
                          className={`h-full rounded-full transition-all duration-medium ${
                            activeGate.riskLevel === 'critical'
                              ? 'bg-critical-500'
                              : activeGate.riskLevel === 'high'
                                ? 'bg-warning-500'
                                : 'bg-primary-500'
                          }`}
                          style={{ width: `${activeGate.occupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-text-secondary leading-relaxed">
                      <strong>Serves Seats:</strong> {activeGate.servedSections.join(', ')}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted">Select an entry gate point above.</p>
                )}
              </section>

              <FanAdvisoryBanner brief={currentDecisionBrief} />
            </div>

            {/* Right main scroll pane: Amenities, Access, Engagement */}
            <div className="col-span-7 space-y-6">
              <AmenitiesFinder
                amenities={amenities}
                selectedGateId={selectedGateId}
              />

              {weather && (
                <section className="p-4 bg-bg-card border border-border-color rounded-large shadow-low flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary-50 dark:bg-secondary-950/40 flex items-center justify-center text-secondary-600 dark:text-secondary-400 shrink-0">
                    <CloudSun className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      Weather Advisory
                    </span>
                    <p className="text-[11px] font-semibold text-text-primary leading-tight mt-0.5">
                      {translateWeather(weather.condition, weather.rainIntensity)}
                    </p>
                  </div>
                </section>
              )}

              <AccessibilityFinder assets={accessibilityAssets} />

              <div className="border-t border-border-color/60 pt-6 space-y-6 bg-bg-card border p-5 rounded-large">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                  <IconWrapper icon={Sparkles} size="sm" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Fan Zone Arena Play</h3>
                </div>
                
                <LivePollWidget
                  homeTeam={metadata?.homeTeam}
                  awayTeam={metadata?.awayTeam}
                />

                <MatchHighlightsFeed matchInfo={matchInfo} />
              </div>
            </div>
          </div>

          {/* TABLET VIEW LAYOUT (md to lg / 768px to 1024px) */}
          <div className="hidden md:flex lg:hidden flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <MatchInfoCard
                  matchInfo={matchInfo}
                  homeTeam={metadata?.homeTeam}
                  awayTeam={metadata?.awayTeam}
                  matchPhase={metadata?.matchPhase}
                />
                
                <section className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-text-primary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      Gate Entry Status
                    </h3>
                    <select
                      value={selectedGateId}
                      onChange={(e) => setSelectedGateId(e.target.value)}
                      className="text-[11px] font-semibold bg-bg-secondary border border-border-color/60 rounded px-2 py-1 focus:outline-none"
                    >
                      {gates.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.displayName.split('—')[0].trim()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeGate ? (
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-bg-secondary/40 border border-border-color/30 rounded-medium text-center space-y-1">
                        <div className="text-sm font-extrabold text-text-primary">
                          {translateGateRisk(activeGate.riskLevel)}
                        </div>
                        <div className="text-[10px] text-text-muted font-medium">
                          Typical queue time: ~{activeGate.queueEstimate} minutes
                        </div>
                      </div>

                      <div className="space-y-1 font-mono text-[9px] text-text-muted">
                        <div className="flex justify-between">
                          <span>Gate Volume Capacity</span>
                          <span className="font-bold">{activeGate.occupancyPercent}% full</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden border border-border-color/30">
                          <div
                            className={`h-full rounded-full transition-all duration-medium ${
                              activeGate.riskLevel === 'critical'
                                ? 'bg-critical-500'
                                : activeGate.riskLevel === 'high'
                                  ? 'bg-warning-500'
                                  : 'bg-primary-500'
                            }`}
                            style={{ width: `${activeGate.occupancyPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-[10px] text-text-secondary leading-relaxed">
                        <strong>Serves Seats:</strong> {activeGate.servedSections.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-muted">Select an entry gate point above.</p>
                  )}
                </section>
              </div>

              <div>
                <StadiumTwinDiagram
                  stadiumContext={stadiumContext}
                  selectedGateId={selectedGateId}
                  onGateClick={handleGateClick}
                  variant="simple"
                />
              </div>
            </div>

            <FanAdvisoryBanner brief={currentDecisionBrief} />

            <div className="grid grid-cols-2 gap-6">
              <AmenitiesFinder
                amenities={amenities}
                selectedGateId={selectedGateId}
              />
              
              <div className="space-y-6">
                {weather && (
                  <section className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary-50 dark:bg-secondary-950/40 flex items-center justify-center text-secondary-600 dark:text-secondary-400 shrink-0">
                      <CloudSun className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                        Weather Advisory
                      </span>
                      <p className="text-[11px] font-semibold text-text-primary leading-tight mt-0.5">
                        {translateWeather(weather.condition, weather.rainIntensity)}
                      </p>
                    </div>
                  </section>
                )}
                <AccessibilityFinder assets={accessibilityAssets} />
              </div>
            </div>

            <div className="border-t border-border-color/60 pt-6 space-y-6 bg-bg-card border p-5 rounded-large">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <IconWrapper icon={Sparkles} size="sm" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Fan Zone Arena Play</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 items-start">
                <LivePollWidget
                  homeTeam={metadata?.homeTeam}
                  awayTeam={metadata?.awayTeam}
                />
                <MatchHighlightsFeed matchInfo={matchInfo} />
              </div>
            </div>
          </div>

          {/* MOBILE VIEW LAYOUT (<768px) */}
          <div className="flex md:hidden flex-col gap-6 w-full max-w-md mx-auto">
            <MatchInfoCard
              matchInfo={matchInfo}
              homeTeam={metadata?.homeTeam}
              awayTeam={metadata?.awayTeam}
              matchPhase={metadata?.matchPhase}
            />

            <StadiumTwinDiagram
              stadiumContext={stadiumContext}
              selectedGateId={selectedGateId}
              onGateClick={handleGateClick}
              variant="simple"
            />

            <section className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold tracking-wider uppercase text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  Gate Entry Status
                </h3>
                <select
                  value={selectedGateId}
                  onChange={(e) => setSelectedGateId(e.target.value)}
                  className="text-[11px] font-semibold bg-bg-secondary border border-border-color/60 rounded px-2 py-1 focus:outline-none"
                >
                  {gates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.displayName.split('—')[0].trim()}
                    </option>
                  ))}
                </select>
              </div>

              {activeGate ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-bg-secondary/40 border border-border-color/30 rounded-medium text-center space-y-1">
                    <div className="text-sm font-extrabold text-text-primary">
                      {translateGateRisk(activeGate.riskLevel)}
                    </div>
                    <div className="text-[10px] text-text-muted font-medium">
                      Typical queue time: ~{activeGate.queueEstimate} minutes
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-[9px] text-text-muted">
                    <div className="flex justify-between">
                      <span>Gate Volume Capacity</span>
                      <span className="font-bold">{activeGate.occupancyPercent}% full</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden border border-border-color/30">
                      <div
                        className={`h-full rounded-full transition-all duration-medium ${
                          activeGate.riskLevel === 'critical'
                            ? 'bg-critical-500'
                            : activeGate.riskLevel === 'high'
                              ? 'bg-warning-500'
                              : 'bg-primary-500'
                        }`}
                        style={{ width: `${activeGate.occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-text-secondary leading-relaxed">
                    <strong>Serves Seats:</strong> {activeGate.servedSections.join(', ')}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-text-muted">Select an entry gate point above.</p>
              )}
            </section>

            <FanAdvisoryBanner brief={currentDecisionBrief} />

            <AmenitiesFinder
              amenities={amenities}
              selectedGateId={selectedGateId}
            />

            {weather && (
              <section className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary-50 dark:bg-secondary-950/40 flex items-center justify-center text-secondary-600 dark:text-secondary-400 shrink-0">
                  <CloudSun className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    Weather Advisory
                  </span>
                  <p className="text-[11px] font-semibold text-text-primary leading-tight mt-0.5">
                    {translateWeather(weather.condition, weather.rainIntensity)}
                  </p>
                </div>
              </section>
            )}

            <AccessibilityFinder assets={accessibilityAssets} />

            <div className="border-t border-border-color/60 pt-6 space-y-6">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <IconWrapper icon={Sparkles} size="sm" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Fan Zone Arena Play</h3>
              </div>
              
              <LivePollWidget
                homeTeam={metadata?.homeTeam}
                awayTeam={metadata?.awayTeam}
              />

              <MatchHighlightsFeed matchInfo={matchInfo} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
