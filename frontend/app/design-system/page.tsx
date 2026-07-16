'use client';

import React, { useState } from 'react';
import { Mail, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Chip } from '../../components/atoms/Chip';
import { Avatar } from '../../components/atoms/Avatar';
import { Input } from '../../components/atoms/Input';
import { Toggle } from '../../components/atoms/Toggle';
import { ProgressBar } from '../../components/atoms/ProgressBar';
import { Tooltip } from '../../components/atoms/Tooltip';

import { SearchBar } from '../../components/molecules/SearchBar';
import { StatCard } from '../../components/molecules/StatCard';
import { ConfidenceBadge } from '../../components/molecules/ConfidenceBadge';
import { EvidenceChip } from '../../components/molecules/EvidenceChip';
import { LanguageSelector } from '../../components/molecules/LanguageSelector';
import { AccessibilityToggle } from '../../components/molecules/AccessibilityToggle';
import { TimelineItem } from '../../components/molecules/TimelineItem';
import { NotificationToast } from '../../components/molecules/NotificationToast';

import { DecisionBrief } from '../../components/organisms/DecisionBrief';
import { StadiumTwinPreview } from '../../components/organisms/StadiumTwinPreview';
import { OperationsSidebar } from '../../components/organisms/OperationsSidebar';
import { PageContainer } from '../../components/organisms/PageContainer';
import { Severity, DecisionBrief as ApiDecisionBrief } from '../../types';

// Mock Decision Brief dataset with varying severity/audiences mapped to new schema
const sampleBriefs: Record<Severity, ApiDecisionBrief> = {
  critical: {
    id: 'db-1',
    trigger: {
      triggerType: 'manual-request',
      reference: 'gate-c',
      triggeredAt: new Date().toISOString(),
    },
    generatedAt: new Date().toISOString(),
    isValid: true,
    recommendation: 'Divert oncoming Metro arrivals to Gate D and dispatch 4 additional volunteers to Gate C for crowd management.',
    reasoning: 'Sensor logs verify turnstile #4 mechanical blockage at Gate C. Arrival rate at Gate C is currently 220 people/minute, exceeding normal capacity by 45%. Gate D is running at 30% capacity and is located 250m west, presenting the optimal path to clear the bottleneck before kickoff.',
    evidence: [
      'Gate C occupancy is at 95% with a CRITICAL risk and increasing trend',
      'Turnstile #4 mechanical blockage reported at Gate C',
      'Transit corridor metro surge of 3200 incoming spectators',
    ],
    urgency: 'critical',
    suggestedActions: [
      'Instruct volunteers Sarah and John to deploy crowd control barriers 50m before Gate C entrance',
      'Update concourse messaging boards to guide incoming Metro passengers to Gate D',
      'Dispatch maintenance team to inspect and repair Turnstile #4',
    ],
    confidence: {
      score: 94,
      tier: 'high',
      breakdown: [
        { factor: 'base_score', impact: 100, reason: 'Starting confidence score.' },
        { factor: 'repair_needed', impact: -6, reason: 'Minor API formatting warning.' },
      ],
    },
    validationErrors: [],
    evidenceWarnings: [],
    contradictionWarning: null,
  },
  warning: {
    id: 'db-2',
    trigger: {
      triggerType: 'scenario-mutation',
      reference: 'global',
      triggeredAt: new Date().toISOString(),
    },
    generatedAt: new Date().toISOString(),
    isValid: true,
    recommendation: 'Activate perimeter canopy shelters, prompt volunteers to distribute rain ponchos, and notify fans of transit boarding gate coverages.',
    reasoning: 'Doppler radar reports a localized thunderstorm front moving northeast, expected to impact the stadium perimeter with heavy rain and gusty winds starting in 15 minutes.',
    evidence: [
      'Doppler Radar reports rain probability 90%',
      'Wind Gauge Node 3 reports gusts up to 45 km/h',
    ],
    urgency: 'high',
    suggestedActions: [
      'Deploy canopy shelters around Concourse zones A and B',
      'Distribute weather ponchos to outdoor mobile volunteers',
    ],
    confidence: {
      score: 76,
      tier: 'moderate',
      breakdown: [
        { factor: 'base_score', impact: 100, reason: 'Starting confidence score.' },
        { factor: 'sparse_signals', impact: -24, reason: 'Low number of inputs.' },
      ],
    },
    validationErrors: [],
    evidenceWarnings: [],
    contradictionWarning: null,
  },
  normal: {
    id: 'db-3',
    trigger: {
      triggerType: 'periodic-scan',
      reference: 'global',
      triggeredAt: new Date().toISOString(),
    },
    generatedAt: new Date().toISOString(),
    isValid: true,
    recommendation: 'Recommend fans utilize the North Transit Hub buses or walk to West Stadium Metro station to bypass platform cues.',
    reasoning: 'Commuter volume at the Stadium-East Metro platform is rising steadily due to consecutive arriving trains, showing slight departure delays.',
    evidence: [
      'Platform occupancy at Stadium-East Metro is exceeding 85%',
      'Bus Corridor shuttle interval is stable at 4 minutes',
    ],
    urgency: 'moderate',
    suggestedActions: [
      'Update mobile assistant app with route bypass options',
    ],
    confidence: {
      score: 89,
      tier: 'high',
      breakdown: [],
    },
    validationErrors: [],
    evidenceWarnings: [],
    contradictionWarning: null,
  },
  resolved: {
    id: 'db-4',
    trigger: {
      triggerType: 'manual-request',
      reference: 'elevator-e2',
      triggeredAt: new Date().toISOString(),
    },
    generatedAt: new Date().toISOString(),
    isValid: true,
    recommendation: 'Restore Elevator E-2 to active service status on the Digital Twin and resume standard accessible routing indicators.',
    reasoning: 'Elevator E-2 serving Sector 4 accessibility suites was reported offline due to a transient power trip. Support technicians have resolved the issue.',
    evidence: [
      'Elevator E-2 voltage feedback stabilized at 240V',
    ],
    urgency: 'low',
    suggestedActions: [
      'Update accessibility state indicator on operations dashboard',
    ],
    confidence: {
      score: 99,
      tier: 'high',
      breakdown: [],
    },
    validationErrors: [],
    evidenceWarnings: [],
    contradictionWarning: null,
  },
};

import LiveTestDashboard from '../../components/organisms/LiveTestDashboard';

export default function DesignSystemPreview() {
  // Component test states
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [showLivePanel, setShowLivePanel] = useState(true);

  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const [toggleChecked, setToggleChecked] = useState(false);
  const [langCode, setLangCode] = useState('en');
  const [searchVal, setSearchVal] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);

  // Toast triggers
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');

  const triggerToast = (msg: string, type: 'info' | 'success' | 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleHighContrastChange = (checked: boolean) => {
    setHighContrast(checked);
  };

  const handleLargeFontChange = (checked: boolean) => {
    setLargeFont(checked);
  };

  // Determine configuration classes applied to wrapper container
  const wrapperClasses = `
    min-h-screen pb-32 bg-bg-primary text-text-primary transition-all duration-medium
    ${themeMode === 'dark' ? 'dark-theme' : 'light-theme'}
    ${highContrast ? 'high-contrast' : ''}
    ${largeFont ? 'text-lg font-medium [&_h1]:text-5xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-base [&_span]:text-sm' : ''}
  `;

  return (
    <div className={wrapperClasses}>
      <PageContainer>
        {/* Navigation/Preview Utilities Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-color pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">ArenaMind Design System</h1>
            <p className="text-text-secondary text-sm mt-1">
              [TEMPORARY DEVELOPER PREVIEW ROUTE — Delete prior to production delivery]
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={showLivePanel ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowLivePanel(!showLivePanel)}
            >
              Toggle Live Wiring Panel: <span className="font-bold ml-1 uppercase">{showLivePanel ? 'ON' : 'OFF'}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              Active Theme: <span className="font-bold ml-1 uppercase">{themeMode}</span>
            </Button>
            <AccessibilityToggle
              isHighContrast={highContrast}
              onHighContrastChange={handleHighContrastChange}
              isLargeFont={largeFont}
              onLargeFontChange={handleLargeFontChange}
            />
          </div>
        </div>

        {/* Live Wiring Panel Section */}
        {showLivePanel && (
          <div className="mb-12">
            <LiveTestDashboard />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Display Grid */}
          <div className="lg:col-span-3 space-y-12">
            {/* 1. Colors & System */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b border-border-color pb-2">1. Theme Colors</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-3 rounded-medium bg-primary-600 text-white text-xs flex flex-col justify-between h-20 shadow-low">
                  <span>Primary</span>
                  <span className="font-mono">#2563eb</span>
                </div>
                <div className="p-3 rounded-medium bg-secondary-500 text-white text-xs flex flex-col justify-between h-20 shadow-low">
                  <span>Secondary</span>
                  <span className="font-mono">#10b981</span>
                </div>
                <div className="p-3 rounded-medium bg-warning-500 text-white text-xs flex flex-col justify-between h-20 shadow-low">
                  <span>Warning</span>
                  <span className="font-mono">#f59e0b</span>
                </div>
                <div className="p-3 rounded-medium bg-critical-600 text-white text-xs flex flex-col justify-between h-20 shadow-low">
                  <span>Critical</span>
                  <span className="font-mono">#dc2626</span>
                </div>
                <div className="p-3 rounded-medium bg-bg-secondary border border-border-color text-text-primary text-xs flex flex-col justify-between h-20 shadow-low">
                  <span>Neutral Surface</span>
                  <span className="font-mono">Variable</span>
                </div>
              </div>
            </section>

            {/* 2. Atoms */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-border-color pb-2">2. Atom Components</h2>

              {/* Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Buttons</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="danger">Danger Button</Button>
                  <Button
                    variant="primary"
                    isLoading={buttonLoading}
                    onClick={() => {
                      setButtonLoading(true);
                      setTimeout(() => setButtonLoading(false), 2000);
                    }}
                  >
                    Click to Load
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                </div>
              </div>

              {/* Badges & Chips */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Badges & Chips</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex gap-2">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="resolved">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="critical">Critical</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Chip label="Static Tag" />
                    <Chip label="Removable Tag" onRemove={() => triggerToast('Tag dismissed', 'info')} />
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-3 max-w-md">
                <h3 className="text-sm font-semibold text-text-secondary">Form Controls</h3>
                <Input
                  label="Sample Input field"
                  placeholder="Enter text..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.length < 3) {
                      setInputError('Text must be at least 3 characters');
                    } else {
                      setInputError('');
                    }
                  }}
                  error={inputError}
                  helperText="Provide at least 3 characters to clear validation warnings."
                />
                <Toggle
                  checked={toggleChecked}
                  onChange={setToggleChecked}
                  label={`State: ${toggleChecked ? 'Enabled' : 'Disabled'}`}
                />
              </div>

              {/* Avatars & Progress */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Avatars & Progress</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex gap-2">
                    <Avatar name="Sarah Connor" />
                    <Avatar name="John Doe" />
                  </div>
                  <div className="grow max-w-xs">
                    <ProgressBar value={72} showLabel />
                  </div>
                  <Tooltip content="Helper notification details overlay" position="top">
                    <span className="text-xs border border-border-color rounded px-2 py-1 bg-bg-secondary cursor-help select-none">
                      Hover for Tooltip
                    </span>
                  </Tooltip>
                </div>
              </div>
            </section>

            {/* 3. Molecules */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-border-color pb-2">3. Molecule Components</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text-secondary">Search & Selectors</h3>
                  <SearchBar value={searchVal} onChange={setSearchVal} placeholder="Search decisions..." />
                  <div className="flex gap-4">
                    <LanguageSelector currentLanguage={langCode} onChange={setLangCode} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text-secondary">Status Badges</h3>
                  <div className="flex gap-4">
                    <ConfidenceBadge confidence={{ percentage: 92, label: 'High Confidence' }} showBar />
                    <ConfidenceBadge confidence={{ percentage: 55, label: 'Moderate Confidence' }} showBar />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <EvidenceChip label="Gate C Sensors" category="gates" />
                    <EvidenceChip label="Turnstile Lock" category="incidents" />
                    <EvidenceChip label="Heavy Concourse Rain" category="weather" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">StatCards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Live Incidents" value="4 Active" trend="up" trendLabel="+2 since 14h" icon={Shield} />
                  <StatCard label="Avg Queue Wait" value="18 Mins" trend="down" trendLabel="-4 mins" />
                  <StatCard label="Total Volunteers" value="184 Active" trend="stable" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Timeline / Logging</h3>
                <div className="max-w-md p-4 bg-bg-secondary rounded-medium border border-border-color">
                  <TimelineItem
                    title="Incident Flagged at Gate C"
                    timestamp="14:23 UTC"
                    description="Turnstile #4 reported jammed due to physical scanner obstruction."
                    icon={AlertTriangle}
                    variant="critical"
                  />
                  <TimelineItem
                    title="AI Decision Brief Generated"
                    timestamp="14:24 UTC"
                    description="System generated diversion brief recommending redistribution to Gate D."
                    icon={Mail}
                    variant="warning"
                  />
                  <TimelineItem
                    title="Brief Dispatched to Concourse Staff"
                    timestamp="14:25 UTC"
                    description="Notifications pushed successfully to 12 active local volunteers."
                    icon={ArrowRight}
                    variant="resolved"
                    isLast
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-text-secondary">Notification Toast Actions</h3>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => triggerToast('Operation completed successfully', 'success')}>
                    Trigger Success Toast
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => triggerToast('System error. Check telemetry Logs', 'error')}>
                    Trigger Error Toast
                  </Button>
                </div>
              </div>
            </section>

            {/* 4. Organisms */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold border-b border-border-color pb-2">4. Organisms</h2>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-secondary">Adaptive AI Decision Brief Cards</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-text-muted block mb-2 font-mono">[Audience: Operations Portal View (Full Details)]</span>
                    <DecisionBrief brief={sampleBriefs.critical} audienceOverride="operations" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text-muted block mb-2 font-mono">[Audience: Match Fan Portal View (Simplified - Omit Perc & Alternatives)]</span>
                    <DecisionBrief brief={sampleBriefs.warning} audienceOverride="fan" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">StadiumTwinPreview</h3>
                  <StadiumTwinPreview />
                </div>

              </div>
            </section>
          </div>

          {/* Sidebar Area for Operations Desktop Navigation Preview */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border-color pb-2 lg:hidden">Sidebars</h2>
            <div className="sticky top-6">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">OperationsSidebar (Desktop-first)</h3>
              <div className="border border-zinc-800 rounded-medium overflow-hidden shadow-high max-w-[260px] h-[550px] flex">
                <OperationsSidebar />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Floating toast message */}
      {toastMessage && (
        <NotificationToast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      

    </div>
  );
}
