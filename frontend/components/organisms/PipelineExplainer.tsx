'use client';

import React from 'react';
import {
  Map,
  Sliders,
  FileCode,
  Sparkles,
  ShieldCheck,
  Percent,
  History,
  ShieldAlert
} from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export const PipelineExplainer: React.FC = () => {
  const stages = [
    {
      num: '1',
      title: 'Context Snapshot',
      icon: Map,
      desc: 'The system reads the current state of the entire stadium: gate occupancy, weather logs, active incident records, accessibility status, and volunteer shifts.',
      trust: 'Captures the operational state objectively before reasoning starts.',
    },
    {
      num: '2',
      title: 'Signal Filtering',
      icon: Sliders,
      desc: 'Narrows down the verbose snapshot to relevant signals based on scope (Gate-scoped, Incident-scoped, or Global scan) and applies strict length limits.',
      trust: 'Prevents noise distraction and token overwhelm—common sources of AI reasoning failure.',
    },
    {
      num: '3',
      title: 'Prompt Assembly',
      icon: FileCode,
      desc: 'Assembles the filtered signals into structured XML blocks inside a system prompt specifying output formats, rules, and grounding requirements.',
      trust: 'Strict structure forces the LLM to cite only actual facts from the provided context.',
    },
    {
      num: '4',
      title: 'LLM Reasoning',
      icon: Sparkles,
      desc: 'Sends the prompt to Google Gemini, which generates a structured JSON output (recommendation, reasoning explanation, evidence citations, actions, urgency).',
      trust: 'Leverages advanced cognitive capability to parse operations under strict constraints.',
    },
    {
      num: '5',
      title: 'Output Validation',
      icon: ShieldCheck,
      desc: 'Validates formatting against the JSON schema, runs repairs if needed, and checks whether all cited evidence matches entities in the source context.',
      trust: 'Fails bad outputs instantly and triggers a regeneration attempt rather than serving raw hallucinations.',
    },
    {
      num: '6',
      title: 'Confidence Scoring',
      icon: Percent,
      desc: 'Determines a deterministic reliability score based on signal availability, retry counts, formatting integrity, and evidence grounding alerts.',
      trust: 'Turns confidence from a vague hunch into an auditable, math-driven penalty breakdown.',
    },
    {
      num: '7',
      title: 'Contradiction Check',
      icon: History,
      desc: 'Scans Decision Memory for recent recommendations concerning the same gate/zone, searching for opposing operational directives.',
      trust: 'Flags conflicting directives automatically to prevent confusing or contradictory staff orders.',
    },
  ];

  const pillars = [
    {
      title: 'Grounding Verification',
      desc: 'The system runs sub-string keyword grounding verification on every piece of evidence cited by Gemini. Any warning is logged and penalizes the confidence score.',
    },
    {
      title: 'Graceful Regeneration & Failure',
      desc: 'If validation fails, the orchestrator triggers exactly one regeneration attempt with error feedback. If it fails again, it gracefully degrades to a safe failure brief.',
    },
    {
      title: 'Self-Aware Contradiction Checks',
      desc: 'By looking back 10 minutes, the pipeline identifies opposing direction commands (e.g. redirect to Gate C vs redirect away from C) and flags warnings.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Architecture Overview */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-medium p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-2">
          General Architecture: One Truth, Multiple Perspectives
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          ArenaMind is designed around a single shared Digital Stadium Twin (the Context Engine) representing the physical venue state. 
          When an event occurs, it triggers the auditable decision pipeline shown below. 
          Once validated and scored, the resulting **AI Decision Brief** is delivered to persona portals: 
          Operations staff get detailed instructions, while spectators receive reassuring, simplified translations.
        </p>
      </section>

      {/* 2. Visual Sequence Flow Diagram */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-medium p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
          The 7-Stage Reasoning Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative">
          {stages.map((s, idx) => (
            <div key={s.num} className="bg-zinc-950 border border-zinc-800 rounded-medium p-3.5 flex flex-col gap-2 relative">
              {/* Connector line for large screens */}
              {idx < 6 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-2 h-0.5 bg-zinc-800 z-10" />
              )}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 rounded-full w-4 h-4 flex items-center justify-center border border-zinc-800">
                  {s.num}
                </span>
                <IconWrapper icon={s.icon} size="sm" className="text-blue-500" />
              </div>
              <h4 className="text-xs font-bold text-zinc-200 mt-1">{s.title}</h4>
              <p className="text-[10px] text-zinc-500 leading-normal flex-1">{s.desc}</p>
              <div className="border-t border-zinc-900 pt-2 mt-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide block">
                  Trust Metric:
                </span>
                <p className="text-[9px] text-zinc-600 leading-tight italic">{s.trust}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Concrete Trust Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((p, idx) => (
          <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-medium flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">{p.title}</h4>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed flex-1">{p.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};
