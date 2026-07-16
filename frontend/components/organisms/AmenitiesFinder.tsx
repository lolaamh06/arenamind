'use client';

import React, { useState } from 'react';
import { Amenity } from '../../types';
import { translateAmenityStatus } from '../../lib/fan-language';
import { Badge } from '../atoms/Badge';
import { Coffee, UtensilsCrossed, Store, Compass } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface AmenitiesFinderProps {
  amenities: Amenity[];
  selectedGateId?: string;
}

export const AmenitiesFinder: React.FC<AmenitiesFinderProps> = ({
  amenities,
  selectedGateId = 'gate-a'
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // Filter and sort amenities. Prioritize those matching selectedGateId first
  const processedAmenities = amenities
    .filter((am) => filterType === 'all' || am.type === filterType)
    .sort((a, b) => {
      const aMatches = a.locationReference === selectedGateId ? 1 : 0;
      const bMatches = b.locationReference === selectedGateId ? 1 : 0;
      // Sort matching gates first
      if (aMatches !== bMatches) {
        return bMatches - aMatches;
      }
      return a.name.localeCompare(b.name);
    });

  const getAmenityIcon = (type: string) => {
    switch (type) {
      case 'food':
        return UtensilsCrossed;
      case 'beverage':
        return Coffee;
      case 'merchandise':
        return Store;
      default:
        return Compass;
    }
  };

  return (
    <section className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low space-y-4">
      {/* Title */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold tracking-wider uppercase text-text-primary flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          Concession Finder
        </h3>
        
        {/* Type Selectors */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-[10px] font-semibold bg-bg-secondary border border-border-color/60 rounded px-2 py-1 focus:outline-none cursor-pointer"
        >
          <option value="all">All Stands</option>
          <option value="food">Food Only</option>
          <option value="beverage">Drinks Only</option>
          <option value="merchandise">Merchandise</option>
        </select>
      </div>

      {/* List */}
      {processedAmenities.length === 0 ? (
        <p className="text-[11px] text-text-muted text-center py-4">No concession stands available.</p>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {processedAmenities.map((am) => {
            const isNear = am.locationReference === selectedGateId;
            const isClosed = am.status === 'closed';
            const isBusy = am.status === 'busy';

            const Icon = getAmenityIcon(am.type);

            return (
              <div
                key={am.id}
                className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-3
                  ${isNear ? 'border-primary-500/30 bg-primary-500/5' : 'border-border-color bg-bg-secondary/20'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0
                    ${isNear ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-neutral-100 dark:bg-neutral-800 text-text-muted'}`}>
                    <IconWrapper icon={Icon} size="sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-text-primary">{am.name}</span>
                      {isNear && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-[8px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                          Near Me
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-secondary mt-0.5 font-sans leading-tight">
                      {am.displayLocation}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant={isClosed ? 'critical' : isBusy ? 'warning' : 'resolved'} className="text-[9px] py-0 px-1.5">
                    {translateAmenityStatus(am.status)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
