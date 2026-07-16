'use client';

import React from 'react';
import { MatchInfo } from '../../types';
import { translateMatchEventType } from '../../lib/fan-language';
import { Clock } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface MatchInfoCardProps {
  matchInfo: MatchInfo | null;
  homeTeam?: string;
  awayTeam?: string;
  matchPhase?: string;
}

export const MatchInfoCard: React.FC<MatchInfoCardProps> = ({
  matchInfo,
  homeTeam = 'Home Team',
  awayTeam = 'Away Team',
  matchPhase = 'unknown'
}) => {
  if (!matchInfo) {
    return (
      <div className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low text-center text-text-muted text-xs">
        Match details loading...
      </div>
    );
  }

  // Soft match phase phrase
  const displayPhase = matchPhase.replace('-', ' ');

  return (
    <section className="p-5 bg-bg-card border border-border-color rounded-medium shadow-low space-y-4">
      {/* scoreboard top */}
      <div className="text-center space-y-1">
        <span className="text-[9px] font-bold font-mono tracking-widest text-primary-600 dark:text-primary-400 uppercase">
          Live Scoreboard
        </span>
        <div className="flex items-center justify-between py-2">
          <div className="w-5/12 text-right">
            <span className="text-xs font-black text-text-primary block truncate">{homeTeam}</span>
          </div>
          
          <div className="w-2/12 flex flex-col items-center justify-center font-mono">
            <span className="text-xl font-black text-primary-600 dark:text-primary-400">
              {matchInfo.homeScore} - {matchInfo.awayScore}
            </span>
          </div>

          <div className="w-5/12 text-left">
            <span className="text-xs font-black text-text-primary block truncate">{awayTeam}</span>
          </div>
        </div>

        {/* Phase/Time indicators */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-text-secondary font-bold">
          <IconWrapper icon={Clock} size="sm" className="text-text-muted shrink-0" />
          <span className="capitalize">{displayPhase}</span>
          <span className="text-text-muted">•</span>
          <span>Minute {matchInfo.matchMinute}{"'-"}</span>
        </div>
      </div>

      {/* Standout players reminder text (simplified lineup info) */}
      {(matchInfo.homeLineup?.length > 0 || matchInfo.awayLineup?.length > 0) && (
        <div className="p-2.5 bg-bg-secondary/40 border border-border-color/30 rounded-xl text-[10px] text-text-secondary text-center leading-snug">
          ⭐ <strong>Starting Key Players:</strong> {matchInfo.homeLineup?.[5]?.name || 'Herrera'} (Dorado) vs {matchInfo.awayLineup?.[5]?.name || 'Thorngren'} (Nordvik)
        </div>
      )}

      {/* Match highlights/recent events timeline */}
      {matchInfo.recentEvents?.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Recent Moments
          </h4>
          <div className="space-y-2 border-l-2 border-border-color pl-3 ml-1.5 font-sans">
            {matchInfo.recentEvents.slice().reverse().map((evt, idx) => (
              <div key={idx} className="relative text-xs">
                {/* timeline node icon bullet */}
                <div className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full bg-border-color" />
                <div className="flex gap-2">
                  <span className="font-mono text-[9px] font-bold text-text-muted shrink-0 mt-0.5">
                    {evt.minute}{"'"}
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-text-primary">
                      {translateMatchEventType(evt.type)}
                    </span>
                    <p className="text-[10px] text-text-secondary leading-snug">
                      {evt.description.split(' — ')[1] || evt.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
