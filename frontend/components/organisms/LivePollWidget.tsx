'use client';

import React, { useState } from 'react';

export interface LivePollWidgetProps {
  homeTeam?: string;
  awayTeam?: string;
}

export const LivePollWidget: React.FC<LivePollWidgetProps> = ({
  homeTeam = 'Atlético Dorado',
  awayTeam = 'FC Nordvik'
}) => {
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [votes, setVotes] = useState({ home: 64, away: 36 });

  const handleVote = (option: 'home' | 'away') => {
    setVotedOption(option);
    setVotes((prev) => ({
      ...prev,
      [option]: prev[option] + 1
    }));
  };

  const totalVotes = votes.home + votes.away;
  const homePercent = Math.round((votes.home / totalVotes) * 100);
  const awayPercent = 100 - homePercent;

  return (
    <div className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low space-y-4">
      {/* Title Header */}
      <div className="flex justify-between items-center px-1">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Spectator Poll
        </h4>
        <span className="text-[9px] text-primary-500 font-bold uppercase font-mono">Live Fan Vote</span>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-primary">
          Who will score the next goal of the match?
        </h3>

        {!votedOption ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVote('home')}
              className="p-3 text-xs font-bold rounded-2xl border border-border-color hover:border-primary-500 hover:bg-primary-50/5 transition-all text-center text-text-primary cursor-pointer"
            >
              {homeTeam}
            </button>
            <button
              onClick={() => handleVote('away')}
              className="p-3 text-xs font-bold rounded-2xl border border-border-color hover:border-primary-500 hover:bg-primary-50/5 transition-all text-center text-text-primary cursor-pointer"
            >
              {awayTeam}
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1.5 font-sans">
            {/* Home progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className={votedOption === 'home' ? 'font-bold text-primary-600' : 'text-text-secondary'}>
                  {homeTeam} {votedOption === 'home' && ' (Your vote)'}
                </span>
                <span className="font-bold text-text-primary">{homePercent}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden border border-border-color/30">
                <div
                  className={`h-full rounded-full transition-all duration-medium bg-primary-500`}
                  style={{ width: `${homePercent}%` }}
                />
              </div>
            </div>

            {/* Away progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className={votedOption === 'away' ? 'font-bold text-primary-600' : 'text-text-secondary'}>
                  {awayTeam} {votedOption === 'away' && ' (Your vote)'}
                </span>
                <span className="font-bold text-text-primary">{awayPercent}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden border border-border-color/30">
                <div
                  className={`h-full rounded-full transition-all duration-medium bg-secondary-500`}
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            </div>

            <p className="text-[9px] text-text-muted text-center italic">
              Thank you for participating! Total votes cast: {totalVotes.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
