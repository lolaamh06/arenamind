'use client';

import React from 'react';
import { Button } from '../atoms/Button';
import { Play, RotateCcw } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface ScenarioControlPanelProps {
  onTriggerScenario: (name: 'heavy-rain' | 'crowd-surge' | 'medical-incident') => void;
  onReset: () => void;
  isTriggering: boolean;
  isResetting: boolean;
}

export const ScenarioControlPanel: React.FC<ScenarioControlPanelProps> = ({
  onTriggerScenario,
  onReset,
  isTriggering,
  isResetting,
}) => {
  return (
    <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-medium shadow-medium flex flex-col gap-4 text-zinc-300 select-none">
      <div>
        <h3 className="text-sm font-bold tracking-wide text-zinc-100 uppercase">
          Simulation Controls
        </h3>
        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
          For demonstration purposes — simulates real-time stadium event inputs and IoT triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Button
          variant="secondary"
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start h-10 text-xs gap-2 font-semibold"
          onClick={() => onTriggerScenario('heavy-rain')}
          isLoading={isTriggering}
          disabled={isResetting}
        >
          {!isTriggering && <IconWrapper icon={Play} size="sm" className="text-primary-500" />}
          <span>Trigger Heavy Rain</span>
        </Button>

        <Button
          variant="secondary"
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start h-10 text-xs gap-2 font-semibold"
          onClick={() => onTriggerScenario('crowd-surge')}
          isLoading={isTriggering}
          disabled={isResetting}
        >
          {!isTriggering && <IconWrapper icon={Play} size="sm" className="text-warning-500" />}
          <span>Trigger Crowd Surge</span>
        </Button>

        <Button
          variant="secondary"
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start h-10 text-xs gap-2 font-semibold"
          onClick={() => onTriggerScenario('medical-incident')}
          isLoading={isTriggering}
          disabled={isResetting}
        >
          {!isTriggering && <IconWrapper icon={Play} size="sm" className="text-critical-500" />}
          <span>Trigger Medical Incident</span>
        </Button>

        <Button
          variant="ghost"
          className="border border-dashed border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 justify-start h-10 text-xs gap-2 font-semibold"
          onClick={onReset}
          isLoading={isResetting}
          disabled={isTriggering}
        >
          {!isResetting && <IconWrapper icon={RotateCcw} size="sm" className="text-zinc-500" />}
          <span>Reset Stadium Twin</span>
        </Button>
      </div>
    </div>
  );
};
