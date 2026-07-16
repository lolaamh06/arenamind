'use client';

import React, { useState } from 'react';
import { useStadiumState } from '../../../../context/StadiumStateContext';
import { DashboardLayout } from '../../../../components/organisms/DashboardLayout';
import { OperationsSidebar } from '../../../../components/organisms/OperationsSidebar';
import { Badge } from '../../../../components/atoms/Badge';
import { ProgressBar } from '../../../../components/atoms/ProgressBar';
import { StadiumTwinDiagram } from '../../../../components/organisms/StadiumTwinDiagram';
import { DecisionBrief } from '../../../../components/organisms/DecisionBrief';
import { Cloud, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { IconWrapper } from '../../../../components/atoms/IconWrapper';

export default function OperationsStadiumTwin() {
  const {
    stadiumContext,
    currentDecisionBrief,
    isLoadingContext,
    isGeneratingDecision,
    requestDecision
  } = useStadiumState();

  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);

  const handleGateClick = async (gateId: string) => {
    setSelectedGateId(gateId);
    await requestDecision('manual-request', gateId, `Manual operator inquiry for ${gateId} via Digital Twin diagram`);
  };

  if (isLoadingContext && !stadiumContext) {
    return (
      <DashboardLayout sidebar={<OperationsSidebar />}>
        <div className="flex flex-col items-center justify-center h-96 gap-4 select-none">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3 w-full max-w-sm text-center shadow-lg">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Synchronizing Digital Twin</h3>
            <p className="text-xs text-zinc-500 max-w-[240px]">
              Connecting to live IoT sensors and telemetry databases...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const metadata = stadiumContext?.metadata;
  const gates = stadiumContext?.gates || [];
  const weather = stadiumContext?.weather;
  const transport = stadiumContext?.transport;
  const matchInfo = stadiumContext?.matchInfo;
  const amenities = stadiumContext?.amenities || [];

  return (
    <DashboardLayout sidebar={<OperationsSidebar />}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
          Digital Stadium Twin Overview
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Real-time spatial visualization and complete structural data model feed.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Core Match, Visual Diagram & Gate Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metadata & Live Score Card */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Live Match Twin</span>
                <h2 className="text-xl font-bold text-zinc-200 mt-1">{metadata?.matchName || 'Match'}</h2>
              </div>
              <Badge variant="neutral" className="uppercase font-mono text-[10px] tracking-wider">
                {metadata?.matchPhase.replace('-', ' ') || 'unknown'}
              </Badge>
            </div>

            {/* Scoreboard and Clock */}
            {matchInfo && (
              <div className="grid grid-cols-3 items-center py-4 px-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/50 text-center">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase block mb-1">Home</span>
                  <span className="text-sm font-black text-zinc-300 block truncate">{metadata?.homeTeam}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 font-mono">
                    {matchInfo.homeScore} - {matchInfo.awayScore}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 mt-1">Min: {matchInfo.matchMinute}{"'-"}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase block mb-1">Away</span>
                  <span className="text-sm font-black text-zinc-300 block truncate">{metadata?.awayTeam}</span>
                </div>
              </div>
            )}

            {/* Stats list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                <span className="text-[10px] font-medium text-zinc-500 uppercase block">Venue</span>
                <span className="text-xs font-bold text-zinc-300 block mt-0.5 truncate">{metadata?.name}</span>
              </div>
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                <span className="text-[10px] font-medium text-zinc-500 uppercase block">City</span>
                <span className="text-xs font-bold text-zinc-300 block mt-0.5">{metadata?.city}</span>
              </div>
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                <span className="text-[10px] font-medium text-zinc-500 uppercase block">Attendance</span>
                <span className="text-xs font-bold text-zinc-300 block mt-0.5">
                  {metadata?.currentAttendance.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/40">
                <span className="text-[10px] font-medium text-zinc-500 uppercase block">Capacity Limit</span>
                <span className="text-xs font-bold text-zinc-300 block mt-0.5">
                  {metadata?.totalCapacity.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Interactive Diagram Centerpiece */}
          <StadiumTwinDiagram
            stadiumContext={stadiumContext}
            selectedGateId={selectedGateId}
            onGateClick={handleGateClick}
            variant="detailed"
          />

          {/* Detailed Gates Telemetry */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Gate Entry Points Detail
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Gate Info</th>
                    <th className="pb-3">Risk Level</th>
                    <th className="pb-3">Queue Size</th>
                    <th className="pb-3">Flow/Trend</th>
                    <th className="pb-3">Occupancy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {gates.map((g) => {
                    const isCritical = g.riskLevel === 'critical';
                    const isHigh = g.riskLevel === 'high';
                    return (
                      <tr key={g.id} className="hover:bg-zinc-950/20 transition-colors">
                        <td className="py-4">
                          <div className="font-semibold text-zinc-200">{g.displayName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {g.id}</div>
                        </td>
                        <td className="py-4">
                          <Badge variant={g.riskLevel === 'critical' || g.riskLevel === 'high' ? 'critical' : g.riskLevel === 'moderate' ? 'warning' : 'primary'}>
                            {g.riskLevel}
                          </Badge>
                        </td>
                        <td className="py-4 font-mono text-zinc-300">
                          {g.queueEstimate.toLocaleString()}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            {g.trend === 'increasing' && <IconWrapper icon={TrendingUp} size="sm" className="text-critical-400" />}
                            {g.trend === 'decreasing' && <IconWrapper icon={TrendingDown} size="sm" className="text-secondary-400" />}
                            <span className="capitalize">{g.trend}</span>
                          </div>
                        </td>
                        <td className="py-4 w-44">
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                              <span>{g.occupancyPercent}%</span>
                            </div>
                            <ProgressBar value={g.occupancyPercent} variant={isCritical || isHigh ? 'critical' : 'primary'} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lineup & Event Detail */}
          {matchInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Lineups */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Active Team Squads
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h3 className="font-bold text-zinc-300 border-b border-zinc-800 pb-1 mb-2">
                      {metadata?.homeTeam}
                    </h3>
                    <ul className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                      {matchInfo.homeLineup.map((p, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{p.name}</span>
                          <span className="text-zinc-600">{p.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-300 border-b border-zinc-800 pb-1 mb-2">
                      {metadata?.awayTeam}
                    </h3>
                    <ul className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                      {matchInfo.awayLineup.map((p, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{p.name}</span>
                          <span className="text-zinc-600">{p.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Match Events */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Match Timeline
                </h2>
                <div className="space-y-3">
                  {matchInfo.recentEvents.map((evt, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <span className="font-mono font-bold text-primary-400 shrink-0">{evt.minute}{"'-"}</span>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-zinc-300 capitalize">{evt.type.replace('-', ' ')}</div>
                        <p className="text-[11px] text-zinc-500 leading-snug">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Col: Active Decision Inquiry, Weather, Transport, Amenities */}
        <div className="space-y-6">
          
          {/* Dispatch Decision Output Card (pops up when they query a gate) */}
          {(selectedGateId || currentDecisionBrief) && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Inquiry Recommendation
              </h2>
              <DecisionBrief
                brief={currentDecisionBrief}
                isLoading={isGeneratingDecision}
                audienceOverride="operations"
              />
            </div>
          )}

          {/* Weather */}
          {weather && (
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Weather Environmental
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-zinc-950/60 flex items-center justify-center text-zinc-400 border border-zinc-800">
                  <IconWrapper icon={Cloud} size="md" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200 capitalize">
                    {weather.condition.replace('-', ' ')}
                  </div>
                  <span className="text-[10px] text-zinc-500 capitalize">Comfort: {weather.comfortIndicator.replace('-', ' ')}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="p-2 bg-zinc-950/30 rounded-xl border border-zinc-800/30">
                  <span className="text-[10px] text-zinc-500 block">Temp</span>
                  <span className="font-bold text-zinc-300 mt-0.5 block">{weather.temperatureCelsius}°C</span>
                </div>
                <div className="p-2 bg-zinc-950/30 rounded-xl border border-zinc-800/30">
                  <span className="text-[10px] text-zinc-500 block">Rain</span>
                  <span className="font-bold text-zinc-300 mt-0.5 block">{weather.rainIntensity}/10</span>
                </div>
                <div className="p-2 bg-zinc-950/30 rounded-xl border border-zinc-800/30">
                  <span className="text-[10px] text-zinc-500 block">Wind</span>
                  <span className="font-bold text-zinc-300 mt-0.5 block">{weather.windSpeedKph} km/h</span>
                </div>
              </div>
            </div>
          )}

          {/* Transport */}
          {transport && (
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Transport Hubs
              </h2>
              <div className="space-y-3">
                {transport.hubs.map((hub) => (
                  <div key={hub.id} className="p-3 bg-zinc-950/30 border border-zinc-800/30 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-zinc-200">{hub.name}</div>
                      <span className="text-[10px] text-zinc-500 capitalize">{hub.type}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant={hub.status === 'delayed' || hub.status === 'suspended' ? 'critical' : hub.status === 'busy' ? 'warning' : 'resolved'}>
                        {hub.status}
                      </Badge>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">Wait: {hub.estimatedWaitMinutes}m</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-[11px] text-zinc-400 leading-snug">
                <span className="font-bold text-zinc-300 uppercase block mb-1">Advisory Message:</span>
                {transport.generalAdvisory}
              </div>
            </div>
          )}

          {/* Amenities */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Concession & Amenities
            </h2>
            <div className="space-y-3">
              {amenities.map((am) => (
                <div key={am.id} className="p-3 bg-zinc-950/30 border border-zinc-800/30 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-zinc-200">{am.name}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{am.type}</span>
                      <span>•</span>
                      <span>{am.displayLocation}</span>
                    </div>
                  </div>
                  <Badge variant={am.status === 'closed' ? 'critical' : am.status === 'busy' ? 'warning' : 'resolved'}>
                    {am.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
