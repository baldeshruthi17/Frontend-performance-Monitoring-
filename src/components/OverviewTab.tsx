import React from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  AlertTriangle, 
  Terminal, 
  CheckCircle, 
  ArrowUpRight, 
  Cpu, 
  Eye, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';

export default function OverviewTab() {
  const { summary, alerts, errors, metrics, resolveAlert, triggerAIAnalysis, setActiveTab } = useAnalytics();

  const activeAlerts = alerts.filter(a => !a.isResolved).slice(0, 4);

  return (
    <div id="overview-tab-view" className="space-y-6">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Active Alert Queue */}
        <div id="overview-alerts-queue" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight">Active Regressions</h3>
                <p className="text-[10px] text-slate-400">Anomalies awaiting remediation</p>
              </div>
              <span className="text-[11px] font-semibold text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                {summary?.totalAlerts || 0} Alert{summary?.totalAlerts !== 1 ? 's' : ''}
              </span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400/80 mx-auto" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">System Fully Stable</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">All Core Web Vitals operate within safe baselines.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5 hover:border-slate-700/80 transition-all duration-300">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${alert.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></span>
                        <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[150px] leading-tight" title={alert.title}>
                          {alert.title}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-mono capitalize px-1.5 py-0.2 rounded ${
                        alert.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                      Cause: {alert.probableCause}
                    </p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500">
                        Value: <b className="text-slate-300">{alert.value}</b> (thr: {alert.threshold})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => triggerAIAnalysis(alert)}
                          className="px-2 py-0.5 bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 text-cyan-400 border border-cyan-500/30 rounded text-[9px] font-medium hover:from-cyan-600/30 hover:to-indigo-600/30 cursor-pointer"
                        >
                          AI Explain
                        </button>
                        <button 
                          onClick={() => resolveAlert(alert.id)}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded text-[9px] hover:bg-slate-800 cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab('alerts')}
            className="w-full text-center text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-all duration-200 mt-2 flex items-center justify-center gap-1 cursor-pointer"
          >
            Review all active alerts
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Recent JS Exceptions */}
        <div id="overview-js-errors" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight">JavaScript Exceptions</h3>
                <p className="text-[10px] text-slate-400">Captured window.onerror crashes</p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                Avg Err Rate: {summary?.errorRate || '0.0'}%
              </span>
            </div>

            {errors.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle className="w-12 h-12 text-teal-400/80 mx-auto" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">No Script Errors Logged</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Hydration processes compiled without exceptions.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 font-mono text-[10px]">
                {errors.slice(0, 5).map(err => {
                  const time = new Date(err.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <div key={err.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 hover:border-indigo-500/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-rose-400 font-bold truncate max-w-[170px]" title={err.message}>
                          {err.message}
                        </span>
                        <span className="text-[9px] text-slate-500">{time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span className="truncate max-w-[150px]" title={err.source}>
                          src: ...{err.source.split('/').pop()}
                        </span>
                        <span className="text-[9px] text-indigo-400">line {err.lineno}:{err.colno}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-mono italic truncate bg-slate-900 px-1 py-0.5 rounded">
                        path: {err.path}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab('playground')}
            className="w-full text-center text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-all duration-200 mt-2 flex items-center justify-center gap-1 cursor-pointer"
          >
            Investigate exceptions trace
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Live Ingress Stream */}
        <div id="overview-telemetry-ingress" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight">Active Sessions Ingress</h3>
                <p className="text-[10px] text-slate-400">Live Browser Performance signals</p>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono animate-pulse">
                live feeds
              </span>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {metrics.slice(0, 5).map(m => {
                const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return (
                  <div key={m.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between hover:border-cyan-500/20 transition-all duration-300">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-100">{m.path}</span>
                        <span className="text-[8px] bg-slate-900 text-slate-400 px-1 rounded uppercase">
                          {m.device}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                        <span>LCP {m.lcp}ms</span>
                        <span>•</span>
                        <span>CLS {m.cls}</span>
                        <span>•</span>
                        <span>INP {m.inp}ms</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] text-slate-500">{time}</span>
                      <span className="text-[9px] font-mono font-medium text-cyan-400 bg-cyan-950/35 border border-cyan-500/15 px-1 rounded">
                        {m.browser.replace(' Mobile', '')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('metrics')}
            className="w-full text-center text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-all duration-200 mt-2 flex items-center justify-center gap-1 cursor-pointer"
          >
            Open detailed metric charts
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Artificial intelligence banner info */}
      <div id="ai-advisor-banner" className="bg-gradient-to-r from-cyan-900/30 via-indigo-950/20 to-slate-900/40 rounded-2xl p-6 border border-cyan-500/20 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-1.5">
              Aetheris Observability AI Advisor Active
            </h4>
            <p className="text-xs text-slate-400 max-w-[550px] leading-relaxed mt-0.5">
              Our automated Performance Monitoring Agent is actively querying telemetry baselines, running anomaly detection algorithms, and compiling resolution optimizations. Use the <b>AI Explain</b> CTA on any alert to fetch real Gemini suggestions.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('recommendations')}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-cyan-500/10 active:scale-95 cursor-pointer shrink-0"
        >
          View Recommendations Guide
        </button>
      </div>

    </div>
  );
}
