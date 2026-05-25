import React from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  BarChart2, 
  AlertTriangle, 
  Cpu, 
  Lightbulb, 
  Terminal, 
  Activity, 
  RefreshCw,
  Zap
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, summary, refreshData, isLoading, isMockSpikeActive } = useAnalytics();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'metrics', label: 'Performance Metrics', icon: Activity },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle, badge: summary?.totalAlerts || 0 },
    { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, badge: summary && summary.totalAlerts > 0 ? 4 : 0 },
    { id: 'playground', label: 'Telemetry Simulator', icon: Terminal }
  ];

  return (
    <aside id="sidebar-panel" className="w-64 bg-slate-950/70 border-r border-slate-800/80 p-5 flex flex-col justify-between backdrop-blur-xl shrink-0 h-full">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Cpu className="text-white w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-sm text-slate-100 tracking-tight leading-none uppercase">Aetheris</h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider">PERF MONITOR v1.2</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-400">Agent Status</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isMockSpikeActive ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="text-[10px] text-slate-300 font-mono font-medium lowercase">
                {isMockSpikeActive ? 'Traffic Surge' : 'Collecting'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Telemetry Feed</span>
            <span className="text-[10px] text-slate-300 font-mono">4.5s polling</span>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/10 text-cyan-400 border border-cyan-500/30' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div id={`nav-btn-inner-${item.id}`} className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-medium font-sans">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.id === 'alerts' && summary?.activeAnomalies && summary.activeAnomalies > 0
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {/* Manual update action */}
        <button
          id="manual-sync"
          onClick={() => refreshData()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-all duration-300 text-xs active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          Force Telemetry Sync
        </button>

        {/* Footer info */}
        <div id="sidebar-footer" className="text-center">
          <p className="text-[10px] text-slate-500 font-mono">Developed via Cloud AI</p>
          <p className="text-[9px] text-slate-600 font-mono mt-0.5">EST. 2026.05.24 UTC</p>
        </div>
      </div>
    </aside>
  );
}
