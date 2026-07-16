'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Send, ArrowLeft } from 'lucide-react';

export default function FanAssistant() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link href="/fan" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fan Portal</span>
          </Link>
          <span className="text-[10px] font-mono text-primary-500 font-bold uppercase tracking-wider">AI Assistant</span>
        </div>

        {/* Chat UI Card */}
        <div className="rounded-large border border-border-color bg-bg-card shadow-medium overflow-hidden flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="p-4 border-b border-border-color bg-bg-secondary flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-text-primary">Solara AI Assistant</h2>
              <span className="text-[9px] text-text-muted font-mono">ON-DEMAND ARENA INTELLIGENCE</span>
            </div>
          </div>

          {/* Chat Logs */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
            {/* AI message */}
            <div className="flex gap-3 max-w-[85%]">
              <div className="h-6 w-6 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 mt-0.5 animate-pulse">
                <Bot className="w-3 h-3" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-bg-secondary border border-border-color text-text-secondary leading-relaxed">
                Hello! I am your AI assistant for Solara Arena. I can help you find parking, restrooms, shorter concession queues, or get details about today&apos;s match. How can I assist you today?
              </div>
            </div>

            {/* User message */}
            <div className="flex gap-3 max-w-[85%] ml-auto justify-end">
              <div className="p-3.5 rounded-2xl rounded-tr-none bg-primary-500/15 border border-primary-500/35 text-text-primary leading-relaxed">
                Which gate has the shortest queue right now?
              </div>
              <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white shrink-0 mt-0.5 text-[10px] font-black">
                ME
              </div>
            </div>

            {/* AI message */}
            <div className="flex gap-3 max-w-[85%]">
              <div className="h-6 w-6 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 mt-0.5">
                <Bot className="w-3 h-3" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-bg-secondary border border-border-color text-text-secondary leading-relaxed">
                Based on current sensor data, <strong className="text-text-primary">Gate A (North Stand)</strong> currently has the shortest waiting line, with an estimated wait time of under 3 minutes. Gate E (South Stand) is currently experiencing moderate queue surges.
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border-color bg-bg-secondary flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about the venue or match..."
              className="flex-1 bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500 text-text-primary"
              disabled
            />
            <button className="h-8 w-8 rounded-xl bg-primary-500 flex items-center justify-center text-white opacity-50 cursor-not-allowed">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
