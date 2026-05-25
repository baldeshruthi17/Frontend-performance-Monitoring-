import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  Sparkles, 
  X, 
  Cpu, 
  Flame, 
  Code, 
  Activity, 
  Copy, 
  Check,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function GeminiAdvisorModal() {
  const { aiAnalysis, clearAIAnalysis, alerts } = useAnalytics();
  const [copied, setCopied] = useState(false);

  if (!aiAnalysis.activeAlertId) return null;

  const targetAlert = alerts.find(a => a.id === aiAnalysis.activeAlertId);
  if (!targetAlert) return null;

  const handleCopy = () => {
    if (aiAnalysis.fixSnippet) {
      navigator.clipboard.writeText(aiAnalysis.fixSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="ai-advisor-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Background closer click area */}
      <div className="absolute inset-0" onClick={clearAIAnalysis}></div>

      {/* Main Drawer Body Panel */}
      <div id="ai-drawer-content" className="relative w-full max-w-2xl bg-slate-950 border-l border-slate-800/80 h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header Block bar */}
        <div id="ai-drawer-header" className="bg-slate-900/60 p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest leading-none">Aetheris AI Advisor</span>
                <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.2 rounded font-semibold leading-none">
                  gemini-3.5-flash
                </span>
              </div>
              <h2 className="text-sm font-bold text-white font-sans mt-1">
                Site Performance Diagnostics Report
              </h2>
            </div>
          </div>

          <button 
            onClick={clearAIAnalysis}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrolling Inner Body contents */}
        <div id="ai-drawer-scroll-body" className="flex-1 p-6 overflow-y-auto space-y-6">
          {aiAnalysis.loading ? (
            /* Aesthetic Loading Shimmer Skeletons */
            <div id="ai-analysis-skeletons" className="space-y-6 animate-pulse">
              <div className="p-4 bg-slate-900/40 rounded-xl space-y-2 border border-slate-800/40">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-3 bg-slate-800 rounded w-2/3"></div>
              </div>
              
              <div className="space-y-2.5">
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-4/5"></div>
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-24 bg-slate-900 rounded border border-slate-800"></div>
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ) : aiAnalysis.error ? (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 font-sans text-xs">
              {aiAnalysis.error}
            </div>
          ) : (
            /* Real content populated successfully */
            <div id="ai-diagnosis-content" className="space-y-6">
              
              {/* Context context pill alert banner */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Alert Context Analyzer</span>
                <h3 className="text-xs font-bold text-slate-200 mt-1">
                  &ldquo;{targetAlert.title}&rdquo;
                </h3>
                <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-slate-400">
                  <span>Metric: <b>{targetAlert.metric}</b></span>
                  <span>Value: <b className="text-rose-400">{targetAlert.value}</b> (thr: {targetAlert.threshold})</span>
                </div>
              </div>

              {/* 1. Root Cause Analysis Description */}
              <div id="ai-analysis-block" className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight font-sans flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  1. AI Diagnostics & Root Cause
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-3">
                  {aiAnalysis.analysis?.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              {/* 2. Anticipated Impact Gain Badge */}
              {aiAnalysis.impactScore && (
                <div id="ai-impact-block" className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider">Estimated Project Impact</span>
                    <p className="text-xs font-semibold text-slate-200">{aiAnalysis.impactScore}</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              )}

              {/* 3. Boilerplate Code Fix Panel */}
              {aiAnalysis.fixSnippet && (
                <div id="ai-code-fix-block" className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-tight font-sans flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    2. Boilerplate Code Correction Patches
                  </h4>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative group">
                    <div className="bg-slate-900/60 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                      <span className="text-[9px] text-slate-500 font-mono font-semibold">Boilerplate Patch</span>
                      
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 hover:border-slate-700 py-1 px-2.5 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto min-h-[100px] max-h-[300px] overflow-y-auto">
                      <code>{aiAnalysis.fixSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* 4. Actionable resolution list checklist */}
              {aiAnalysis.suggestedSteps && aiAnalysis.suggestedSteps.length > 0 && (
                <div id="ai-resolution-checklist" className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-tight font-sans flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    3. Structured Operational Remediations
                  </h4>
                  
                  <div className="space-y-2">
                    {aiAnalysis.suggestedSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 bg-slate-900/40 rounded-xl border border-slate-900 hover:border-slate-800/80 transition-all duration-200">
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-300 font-sans">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info lock actions */}
        <div id="ai-drawer-footer" className="bg-slate-900/60 p-6 border-t border-slate-800/80 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-mono">
            Analysis incorporates real-time parameters from dynamic baseline metrics.
          </p>
          <button
            onClick={clearAIAnalysis}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 font-sans font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>

    </div>
  );
}
