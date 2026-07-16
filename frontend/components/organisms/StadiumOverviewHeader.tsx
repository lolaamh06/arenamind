'use client';

import React from 'react';
import { StadiumMetadata, Weather } from '../../types';
import { Cloud, Users } from 'lucide-react';

export interface StadiumOverviewHeaderProps {
  metadata?: StadiumMetadata;
  weather?: Weather;
}

export const StadiumOverviewHeader: React.FC<StadiumOverviewHeaderProps> = ({
  metadata,
  weather,
}) => {
  if (!metadata) {
    return (
      <div className="w-full h-12 bg-bg-card border border-border-color rounded-medium animate-pulse" />
    );
  }

  const attendancePercent = Math.round((metadata.currentAttendance / metadata.totalCapacity) * 100);

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-bg-card border border-border-color p-5 rounded-medium shadow-low">
      <div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-xs font-bold uppercase tracking-widest font-mono text-primary-600 dark:text-primary-400">
            {metadata.city}, {metadata.country}
          </span>
          <span className="text-text-muted">•</span>
          <span className="text-xs font-semibold">{metadata.name}</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-text-primary mt-0.5">
          {metadata.matchName}
        </h1>
        <p className="text-xs text-text-secondary mt-0.5 font-medium">
          Match Phase: <span className="font-bold text-text-primary capitalize">{metadata.matchPhase.replace('-', ' ')}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-5 items-center justify-start md:justify-end w-full md:w-auto">
        {/* Attendance widget */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Attendance
            </span>
            <span className="text-xs font-extrabold text-text-primary">
              {metadata.currentAttendance.toLocaleString()} / {metadata.totalCapacity.toLocaleString()}
            </span>
            <span className="text-[9px] text-text-muted font-medium">
              {attendancePercent}% seating capacity filled
            </span>
          </div>
        </div>

        {/* Weather widget */}
        {weather && (
          <div className="flex items-center gap-3 border-l border-border-color/50 pl-5">
            <div className="h-9 w-9 rounded-full bg-secondary-500/10 flex items-center justify-center text-secondary-600 dark:text-secondary-400">
              <Cloud className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Weather
              </span>
              <span className="text-xs font-extrabold text-text-primary capitalize">
                {weather.condition}
              </span>
              <span className="text-[9px] text-text-muted font-medium">
                {weather.temperatureCelsius}°C | Rain: {weather.rainIntensity}/10
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
