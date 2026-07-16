'use client';

import React, { useState } from 'react';
import { useStadiumState } from '../../../../context/StadiumStateContext';
import { DashboardLayout } from '../../../../components/organisms/DashboardLayout';
import { OperationsSidebar } from '../../../../components/organisms/OperationsSidebar';
import { Badge } from '../../../../components/atoms/Badge';
import { Filter, Users, Clipboard, RefreshCw } from 'lucide-react';
import { IconWrapper } from '../../../../components/atoms/IconWrapper';

export default function OperationsVolunteers() {
  const { stadiumContext, isLoadingContext } = useStadiumState();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const volunteers = stadiumContext?.volunteers || [];

  // Filter & sort: order by 'available' first, then 'assigned', then others.
  const statusPriority: Record<string, number> = {
    available: 1,
    assigned: 2,
    'on-break': 3,
    'off-duty': 4,
  };

  const filteredVolunteers = volunteers
    .filter((v) => statusFilter === 'all' || v.status === statusFilter)
    .sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.displayName.localeCompare(b.displayName);
    });

  return (
    <DashboardLayout sidebar={<OperationsSidebar />}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            Volunteer & Staff Roster
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Monitor and coordinate on-ground support personnel distributed across gates.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs">
          <IconWrapper icon={Filter} size="sm" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-zinc-200 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-zinc-950 text-zinc-200">All Volunteers</option>
            <option value="available" className="bg-zinc-950 text-zinc-200">Available</option>
            <option value="assigned" className="bg-zinc-950 text-zinc-200">Assigned</option>
            <option value="on-break" className="bg-zinc-950 text-zinc-200">On Break</option>
            <option value="off-duty" className="bg-zinc-950 text-zinc-200">Off Duty</option>
          </select>
        </div>
      </div>

      {isLoadingContext && !stadiumContext ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 select-none">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3 w-full max-w-sm text-center shadow-lg">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Loading Volunteer Roster</h3>
            <p className="text-xs text-zinc-500 max-w-[240px]">
              Querying on-ground staff allocations...
            </p>
          </div>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 py-20">
          <div className="h-12 w-12 rounded-2xl bg-zinc-950/60 text-zinc-400 flex items-center justify-center mb-4 border border-zinc-850">
            <IconWrapper icon={Users} size="md" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">No volunteers found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Try adjusting your status filter selection to view other roster members.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVolunteers.map((v) => {
            const isAvailable = v.status === 'available';
            const isAssigned = v.status === 'assigned';
            const isOnBreak = v.status === 'on-break';

            return (
              <div
                key={v.id}
                className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between gap-4"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{v.displayName}</h3>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">ID: {v.id}</span>
                  </div>
                  <Badge variant={isAvailable ? 'resolved' : isAssigned ? 'primary' : isOnBreak ? 'warning' : 'neutral'}>
                    {v.status}
                  </Badge>
                </div>

                {/* Task description */}
                <div className="flex gap-2.5 p-3 rounded-2xl bg-zinc-950/40 border border-zinc-850 text-xs">
                  <div className="text-zinc-500 shrink-0 mt-0.5">
                    <IconWrapper icon={Clipboard} size="sm" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Current Duty Task</span>
                    <p className="text-zinc-300 leading-snug font-mono text-[11px]">{v.currentTask}</p>
                  </div>
                </div>

                {/* Bottom zone location */}
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                  <span>Assigned Sector</span>
                  <span className="text-zinc-300">{v.assignedZone}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
