import React from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { ShieldCheck, Flame, Gauge, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function StatisticsCards() {
  const { summary, isMockSpikeActive } = useAnalytics();

  if (!summary) {
    return (
      <div id="stats-loading-shimmer" className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
        ))}
      </div>
    );
  }

  // Helpers to calculate health thresholds and text colors
  const getLcpStatus = (val: number) => {
    if (val <= 2500) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (val <= 4000) return { label: 'Needs Imp.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Critical', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const getClsStatus = (val: number) => {
    if (val <= 0.1) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (val <= 0.25) return { label: 'Needs Imp.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Poor', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const getInpStatus = (val: number) => {
    if (val <= 200) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (val <= 500) return { label: 'Needs Imp.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Poor', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const lcpInfo = getLcpStatus(summary.avgLcp);
  const clsInfo = getClsStatus(summary.avgCls);
  const inpInfo = getInpStatus(summary.avgInp);

  return (
    <div id="statistics-grid" className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      {/* 1. Overall Health Score */}
      <div id="stat-score-card" className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/15 transition-all duration-500"></div>
        <div className="space-y-1">
          <span className="text-slate-400 text-xs font-medium">Core Health Score</span>
          <div className="flex items-baseline gap-1">
            <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              {summary.performanceScore}<span className="text-xs text-slate-500 font-normal">/100</span>
            </h2>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 ml-1 shrink-0 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            Weighted CWV telemetry
          </p>
        </div>
        
        {/* Visual Score Ring */}
        <div id="visual-score-ring" className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="transparent" />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              className="stroke-cyan-500 transition-all duration-1000 ease-out" 
              strokeWidth="4.5" 
              fill="transparent" 
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - summary.performanceScore / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center text-xs font-bold text-slate-200">
            {summary.performanceScore}%
          </div>
        </div>
      </div>

      {/* 2. Avg LCP */}
      <div id="stat-lcp-card" className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium">Largest Contentful Paint (LCP)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lcpInfo.bg} ${lcpInfo.color}`}>
            {lcpInfo.label}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-3xl font-extrabold text-slate-100 font-sans">
            {parseFloat((summary.avgLcp / 1000).toFixed(2))}<span className="text-sm font-normal text-slate-500 ml-0.5">s</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">({summary.avgLcp}ms)</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> Target range</span>
          <span className="font-mono text-slate-300">&lt; 2.5s</span>
        </div>
      </div>

      {/* 3. Avg CLS */}
      <div id="stat-cls-card" className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium">Cumulative Layout Shift (CLS)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${clsInfo.bg} ${clsInfo.color}`}>
            {clsInfo.label}
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 font-sans">
            {summary.avgCls}
          </h2>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-slate-500" /> Stability limits</span>
          <span className="font-mono text-slate-300">&lt; 0.10</span>
        </div>
      </div>

      {/* 4. Avg INP */}
      <div id="stat-inp-card" className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-300"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium">Interaction to Next Paint (INP)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${inpInfo.bg} ${inpInfo.color}`}>
            {inpInfo.label}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <h2 className="text-3xl font-extrabold text-slate-100 font-sans">
            {summary.avgInp}
          </h2>
          <span className="text-xs text-slate-500">ms</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-slate-500" /> Interactive delay</span>
          <span className="font-mono text-slate-300">&lt; 200ms</span>
        </div>
      </div>

    </div>
  );
}
