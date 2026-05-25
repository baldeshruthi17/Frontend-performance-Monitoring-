import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Clock
} from 'lucide-react';

export default function AlertsTab() {
  const { alerts, resolveAlert, triggerAIAnalysis, aiAnalysis } = useAnalytics();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [filterResolved, setFilterResolved] = useState<'active' | 'resolved' | 'all'>('active');

  // Filter thresholds
  const filteredAlerts = alerts.filter(alert => {
    const sevMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const resValue = alert.isResolved;
    const resMatch = 
      filterResolved === 'all' || 
      (filterResolved === 'active' && !resValue) || 
      (filterResolved === 'resolved' && resValue);
    return sevMatch && resMatch;
  });

  return (
    <div id="alerts-tab-view" className="space-y-6">
      
      {/* Filters Header toolbar */}
      <div id="alerts-filters-header" className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight">Active Warning Alerts Center</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Automated detection of regression spikes, errors surges, or network drops.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filter Status */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterResolved('active')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filterResolved === 'active' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterResolved('resolved')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filterResolved === 'resolved' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilterResolved('all')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filterResolved === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
          </div>

          {/* Filter Severity */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filterSeverity === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Severities
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filterSeverity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                filterSeverity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warning
            </button>
          </div>
        </div>
      </div>

      {/* Main Alerts List */}
      <div id="alerts-grid-panel" className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="border border-slate-800 border-dashed rounded-2xl py-12 text-center bg-slate-900/10">
            <CheckCircle className="w-14 h-14 text-emerald-400/75 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-100">No matching alert logs matching filter criteria found</h4>
            <p className="text-xs text-slate-400 max-w-[400px] mx-auto mt-1 leading-relaxed">
              All client processes hydrate perfectly. Try modifying thresholds inside mock-playground tab to physical trigger test anomalies.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const timeFormatted = new Date(alert.timestamp).toLocaleString();
            const isCritical = alert.severity === 'critical';
            return (
              <div 
                key={alert.id}
                id={`alert-row-${alert.id}`}
                className={`bg-slate-900/40 backdrop-blur-md border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all duration-300 relative overflow-hidden group ${
                  alert.isResolved 
                    ? 'border-slate-800/80 opacity-75' 
                    : isCritical 
                      ? 'border-rose-500/25 shadow-lg shadow-rose-950/5' 
                      : 'border-amber-500/25 shadow-lg shadow-amber-950/5'
                }`}
              >
                {/* Background flare on hover */}
                <div className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full blur-2xl group-hover:block hidden opacity-20 ${
                  isCritical ? 'bg-rose-500' : 'bg-amber-500'
                }`}></div>

                {/* Left region description */}
                <div className="space-y-2 max-w-[580px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      alert.isResolved 
                        ? 'bg-slate-800 text-slate-400' 
                        : isCritical 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 animate-pulse' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                    }`}>
                      {alert.isResolved ? 'Resolved' : alert.severity}
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950/65 px-1.5 py-0.5 rounded border border-slate-900">
                      Metric: {alert.metric}
                    </span>

                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {timeFormatted}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 tracking-tight leading-snug">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-400 italic">
                    <b>Probable Origin:</b> {alert.probableCause} (Calculated confidence score: <b className="text-cyan-400">{Math.round(alert.confidence * 100)}%</b>)
                  </p>
                </div>

                {/* Right side metric value and actions */}
                <div id="alert-action-region" className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">Aggregate Value vs Thr:</span>
                    <span className={`text-xl font-extrabold font-mono block ${alert.isResolved ? 'text-slate-400' : isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                      {alert.value} <span className="text-xs text-slate-500 font-normal">/ {alert.threshold}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ask AI Trigger */}
                    {!alert.isResolved && (
                      <button
                        onClick={() => triggerAIAnalysis(alert)}
                        className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-md shadow-indigo-600/15 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                        AI Diagnostics
                      </button>
                    )}

                    {/* Resolve Trigger */}
                    {!alert.isResolved ? (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                      >
                        Mark Fixed
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        Fixed ✓
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
