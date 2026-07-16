'use client';

import React from 'react';
import { MatchInfo } from '../../types';
import { translateMatchEventType } from '../../lib/fan-language';
import { Heart, Share2 } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface MatchHighlightsFeedProps {
  matchInfo: MatchInfo | null;
}

export const MatchHighlightsFeed: React.FC<MatchHighlightsFeedProps> = ({ matchInfo }) => {
  // Static fan/crowd atmosphere entries
  const atmosphereHighlights = [
    {
      time: '65',
      title: 'Atmosphere is Electric!',
      body: 'Chants are echoing from the North Stand as the home crowd spurs the team on.',
      icon: '🙌'
    },
    {
      time: '30',
      title: 'Packed House at Solara',
      body: 'Stunning spectator turnout fills almost every seat in the stadium tonight.',
      icon: '🏟️'
    }
  ];

  // Map real match events to display items
  const liveEvents = matchInfo?.recentEvents || [];
  const eventHighlights = liveEvents.map((evt) => {
    const icon = evt.type === 'goal' ? '⚽' : evt.type === 'yellow-card' ? '🟨' : '📢';
    return {
      time: String(evt.minute),
      title: translateMatchEventType(evt.type),
      body: evt.description.split(' — ')[1] || evt.description,
      icon
    };
  });

  // Combine highlights, sorting by simulated match minute
  const allHighlights = [...eventHighlights, ...atmosphereHighlights].sort(
    (a, b) => Number(b.time) - Number(a.time)
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Match Highlights & Moments
        </h4>
        <span className="text-[9px] text-primary-500 font-bold uppercase font-mono">Fan Engagement Feed</span>
      </div>

      <div className="space-y-3">
        {allHighlights.map((hl, idx) => (
          <div key={idx} className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low space-y-3">
            <div className="flex justify-between items-start gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">{hl.icon}</span>
                <div>
                  <h5 className="font-bold text-text-primary">{hl.title}</h5>
                  <span className="text-[9px] text-text-muted font-mono">{hl.time}{"'"} minute</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {hl.body}
            </p>

            {/* Social mockup interactions */}
            <div className="flex items-center gap-4 text-[10px] text-text-muted font-semibold border-t border-border-color/30 pt-2.5">
              <button className="flex items-center gap-1 hover:text-primary-600 cursor-pointer">
                <IconWrapper icon={Heart} size="sm" />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary-600 cursor-pointer">
                <IconWrapper icon={Share2} size="sm" />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
