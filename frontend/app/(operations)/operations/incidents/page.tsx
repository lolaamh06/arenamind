'use client';

import React, { useState } from 'react';
import { useStadiumState } from '../../../../context/StadiumStateContext';
import { DashboardLayout } from '../../../../components/organisms/DashboardLayout';
import { OperationsSidebar } from '../../../../components/organisms/OperationsSidebar';
import { Badge } from '../../../../components/atoms/Badge';
import { CheckCircle2, ShieldAlert, Filter, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { IconWrapper } from '../../../../components/atoms/IconWrapper';

export default function OperationsIncidents() {
  const { stadiumContext, isLoadingContext } = useStadiumState();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const incidents = stadiumContext?.incidents || [];

  // Filtered incidents list
  const filteredIncidents = incidents.filter((inc) => {
    const statusMatch = statusFilter === 'all' || inc.status === statusFilter;
    const severityMatch = severityFilter === 'all' || inc.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  return (
    <DashboardLayout sidebar={<OperationsSidebar />}>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            Incident Control Center
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Log, track, and filter active or resolved issues happening across the venue.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400">
            <IconWrapper icon={Filter} size="sm" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-zinc-200">All Statuses</option>
              <option value="open" className="bg-zinc-950 text-zinc-200">Open</option>
              <option value="monitoring" className="bg-zinc-950 text-zinc-200">Monitoring</option>
              <option value="resolved" className="bg-zinc-950 text-zinc-200">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400">
            <IconWrapper icon={Filter} size="sm" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent border-none text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-zinc-200">All Severities</option>
              <option value="critical" className="bg-zinc-950 text-zinc-200">Critical</option>
              <option value="high" className="bg-zinc-950 text-zinc-200">High</option>
              <option value="moderate" className="bg-zinc-950 text-zinc-200">Moderate</option>
              <option value="low" className="bg-zinc-950 text-zinc-200">Low</option>
            </select>
          </div>
        </div>
      </div>

      {isLoadingContext && !stadiumContext ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 select-none">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3 w-full max-w-sm text-center shadow-lg">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Loading Incident Data</h3>
            <p className="text-xs text-zinc-500 max-w-[240px]">
              Querying active stadium dispatch logs...
            </p>
          </div>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 py-20">
          <div className="h-12 w-12 rounded-2xl bg-secondary-950/40 text-secondary-400 flex items-center justify-center mb-4">
            <IconWrapper icon={CheckCircle2} size="md" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">No active incidents — all clear</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            There are no incidents matching the selected criteria. The venue is operating smoothly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredIncidents.map((inc) => {
            const isCritical = inc.severity === 'critical';
            const isHigh = inc.severity === 'high';
            const isResolved = inc.status === 'resolved';

            return (
              <div
                key={inc.id}
                className={`p-6 rounded-3xl border transition-all hover:bg-zinc-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                  ${isCritical ? 'border-critical-900/50 bg-critical-950/10' : 'border-zinc-800 bg-zinc-900/20'}`}
              >
                {/* Details */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {inc.id}
                    </span>
                    <Badge variant={isCritical || isHigh ? 'critical' : inc.severity === 'moderate' ? 'warning' : 'neutral'}>
                      {inc.severity} severity
                    </Badge>
                    <Badge variant={isResolved ? 'resolved' : 'neutral'}>
                      {inc.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 capitalize">
                      {inc.incidentType.replace('-', ' ')}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                      {inc.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 font-mono">
                    <div className="flex items-center gap-1">
                      <IconWrapper icon={MapPin} size="sm" />
                      <span>{inc.displayLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconWrapper icon={Calendar} size="sm" />
                      <span>{new Date(inc.reportedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Severity Alert Indicator Box */}
                {(isCritical || isHigh) && !isResolved && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-critical-900/20 border border-critical-800/30 text-critical-400 text-xs font-semibold shrink-0">
                    <IconWrapper icon={ShieldAlert} size="sm" />
                    <span>Requires Dispatch</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
