import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { Lightbulb, Sparkles, Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function RecommendationsTab() {
  const { recommendations } = useAnalytics();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSnippet = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  if (recommendations.length === 0) {
    return (
      <div id="recs-empty-panel" className="border border-slate-800 border-dashed rounded-2xl py-12 text-center bg-slate-900/10">
        <Lightbulb className="w-14 h-14 text-indigo-400 mx-auto mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-100 font-sans">Compiling Optimization Opportunities...</h4>
        <p className="text-xs text-slate-400 max-w-[420px] mx-auto mt-1 leading-relaxed">
          The recommendation scanner evaluates overall metric averages. Once an average shifts, custom boilerplate patches will populate instantly.
        </p>
      </div>
    );
  }

  return (
    <div id="recs-tab-view" className="space-y-6">
      
      {/* Intro info box */}
      <div id="recs-title-pane">
        <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400 animate-pulse" />
          AI-Suggested Performance Resolutions
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Automated visual optimization code suggestions. Click items to inspect and copy implementation boilerplate patches.</p>
      </div>

      {/* Recommendations Cards Map */}
      <div id="recs-cards-grid" className="grid grid-cols-1 gap-4">
        {recommendations.map(rec => {
          const isExpanded = expandedId === rec.id;
          const isCopied = copiedId === rec.id;

          const sevColors = {
            high: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            low: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }[rec.severity];

          return (
            <div 
              key={rec.id}
              id={`rec-item-${rec.id}`}
              className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 hover:border-slate-700 transition-all duration-300 space-y-4"
            >
              {/* Header bar row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${sevColors}`}>
                      {rec.severity} priority
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 border border-slate-900 rounded">
                      Metric: {rec.metric}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                      Effort: {rec.estimatedEffort}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 leading-snug">
                    {rec.title}
                  </h4>
                </div>

                {/* Anticipated gain indicators */}
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Estimated Gain</span>
                  <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {rec.expectedImpact}
                  </span>
                </div>
              </div>

              {/* Main explanation body */}
              <p className="text-xs text-slate-300 leading-relaxed max-w-[700px]">
                {rec.description}
              </p>

              {/* Specific cause context */}
              <div className="text-[11px] text-slate-400 font-sans">
                <b>Identified root problem:</b> <span className="italic">{rec.rootCause}</span>
              </div>

              {/* Expand snippet slider button container */}
              {rec.snippet && (
                <div className="pt-2">
                  <button
                    onClick={() => toggleSnippet(rec.id)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    {isExpanded ? 'Hide optimization code fix' : 'View optimization code fix'}
                    {isExpanded ? <ChevronUp className="w-4 h-4 ml-0.5" /> : <ChevronDown className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Expansion window */}
                  {isExpanded && (
                    <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative group">
                      
                      {/* Sub header toolbar */}
                      <div className="bg-slate-900/60 py-2 pin-x border-b border-slate-800 flex items-center justify-between px-4">
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">Implementation Boilerplate</span>
                        
                        <button
                          onClick={() => copyCode(rec.id, rec.snippet || '')}
                          className="flex items-center gap-1 py-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copied' : 'Copy boiler'}
                        </button>
                      </div>

                      {/* Snippet box */}
                      <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto selection:bg-cyan-500 selection:text-slate-950 max-h-[300px] overflow-y-auto">
                        <code>{rec.snippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
