'use client';

import React from 'react';
import { AccessibilityAsset } from '../../types';
import { Accessibility } from 'lucide-react';
import { translateAccessibilityStatus } from '../../lib/fan-language';
import { IconWrapper } from '../atoms/IconWrapper';

interface AccessibilityFinderProps {
  assets: AccessibilityAsset[];
}

export const AccessibilityFinder: React.FC<AccessibilityFinderProps> = ({ assets }) => {
  // Only surface elevator and escalator statuses to avoid concourse clutter
  const filteredAssets = assets.filter(
    (a) => a.assetType === 'elevator' || a.assetType === 'escalator'
  );

  return (
    <div className="p-4 bg-bg-card border border-border-color rounded-medium shadow-low flex flex-col gap-3 select-none">
      <div className="flex items-center gap-2 border-b border-border-color/30 pb-2">
        <IconWrapper icon={Accessibility} size="md" className="text-primary-600 dark:text-primary-400" />
        <h3 className="text-xs font-bold tracking-wider uppercase text-text-primary">
          Accessibility Status Finder
        </h3>
      </div>

      <div className="space-y-2.5">
        {filteredAssets.length === 0 ? (
          <p className="text-[11px] text-text-muted">
            All accessibility assets are operating normally.
          </p>
        ) : (
          filteredAssets.map((asset) => {
            const isOutOfService = asset.status === 'out-of-service';
            const friendlyText = translateAccessibilityStatus(
              asset.assetType,
              asset.status,
              asset.displayLocation
            );

            return (
              <div
                key={asset.id}
                className={`p-2.5 rounded-medium border text-[11px] leading-relaxed font-medium transition-all ${
                  isOutOfService
                    ? 'border-warning-500/30 bg-warning-50/5 text-warning-800 dark:text-warning-300'
                    : 'border-border-color/50 bg-bg-secondary/40 text-text-secondary'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5 font-bold">
                  <span className="capitalize">{asset.assetType}</span>
                  <span className={isOutOfService ? 'text-warning-600 font-extrabold font-mono text-[9px] uppercase' : 'text-[9px] uppercase opacity-75'}>
                    {isOutOfService ? 'Action Needed' : 'Operational'}
                  </span>
                </div>
                {friendlyText}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
