import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { Terminal, Send, Eye, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export default function PlaygroundTab() {
  const { sendManualTelemetry, errors, isMockSpikeActive, refreshData } = useAnalytics();
  const [selectedPath, setSelectedPath] = useState('/');
  const [speedType, setSpeedType] = useState<'fast' | 'slow' | 'crash'>('fast');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[System] Telemetry client initialized. Live traffic loop is spinning.",
    "[Simulator] Automatic polling tick active (4.5s intervals)."
  ]);
  const [isSending, setIsSending] = useState(false);

  const writeConsole = (message: string) => {
    setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleInject = async () => {
    setIsSending(true);
    writeConsole(`[Signal Ingest] Emitting manual browser packet on route '${selectedPath}' with '${speedType}' profile...`);
    
    try {
      await sendManualTelemetry(selectedPath, speedType);
      writeConsole(`[Success] Telemetry reported successfully. Server state sync complete.`);
      if (speedType === 'slow') {
        writeConsole(`[Alert Warning] Telemetry values exceeded. Check Alert Center for new metrics alerts.`);
      } else if (speedType === 'crash') {
        writeConsole(`[Critical Error] Captured uncaught bundle exception on index.js. Logged error stack.`);
      }
    } catch (e) {
      writeConsole(`[Error] Failed to connect to server ingestion endpoint.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="playground-tab-view" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Ingestion Control panel */}
      <div id="telemetry-injector-panel" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight flex items-center gap-1.5 animate-pulse">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Manual Telemetry Injection
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Physical control interface to inject custom speed parameters on mock routes. Stress-test alerts calculations immediately.</p>
        </div>

        {/* Path Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300 block uppercase font-mono">1. Select Target Virtual route</label>
          <div className="grid grid-cols-3 gap-2">
            {['/', '/pricing', '/checkout', '/dashboard', '/products', '/docs'].map(path => (
              <button
                key={path}
                onClick={() => setSelectedPath(path)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedPath === path 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35' 
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-slate-800/80 hover:bg-slate-900/30'
                }`}
              >
                {path}
              </button>
            ))}
          </div>
        </div>

        {/* Speed profile */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300 block uppercase font-mono">2. Set Speed and Performance profile</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'fast', label: 'Optimized (Fast)', desc: 'LCP ~950ms / CLS ~0.02', color: 'hover:border-emerald-500/30' },
              { id: 'slow', label: 'Degraded (Slow)', desc: 'LCP ~2800ms (Trigger Alert!)', color: 'hover:border-amber-500/30' },
              { id: 'crash', label: 'Crash surge (Exception)', desc: 'Surge error rates + Latency Spikes', color: 'hover:border-rose-500/30' }
            ].map(prof => (
              <button
                key={prof.id}
                onClick={() => setSpeedType(prof.id as any)}
                className={`p-3 text-left rounded-xl border transition-all duration-300 cursor-pointer ${prof.color} ${
                  speedType === prof.id
                    ? prof.id === 'fast'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : prof.id === 'slow'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-300/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-transparent text-slate-400 border-slate-800/80 hover:bg-slate-900/30'
                }`}
              >
                <span className="text-xs font-bold block">{prof.label}</span>
                <span className="text-[9px] text-slate-500 block mt-1 font-mono tracking-tight leading-none">{prof.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleInject}
          disabled={isSending}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Send className={`w-3.5 h-3.5 text-slate-950 ${isSending ? 'animate-ping' : ''}`} />
          {isSending ? 'Sending telemetry...' : 'Inject Telemetry Packet'}
        </button>
      </div>

      {/* 2. Logging and Simulator trace output console */}
      <div id="trace-terminal-panel" className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between h-[450px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-sidebar-border-line-color mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold font-sans text-slate-300 uppercase tracking-tight">Active Trace Log Terminal</span>
            </div>
            <button
              onClick={() => setConsoleLogs(["[System] Terminal trace buffer cleared."])}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold"
            >
              Clear Buffer
            </button>
          </div>

          {/* Scrolling shell content */}
          <div className="space-y-1.5 font-mono text-[10px] text-slate-300 overflow-y-auto max-h-[300px] h-[300px] bg-slate-900/40 p-4 rounded-xl border border-slate-900 pr-1 select-all select-none">
            {consoleLogs.map((log, idx) => {
              let tagColor = 'text-slate-400';
              if (log.includes('[Success]')) tagColor = 'text-emerald-400';
              if (log.includes('[Alert')) tagColor = 'text-amber-400';
              if (log.includes('[Critical')) tagColor = 'text-rose-400';
              if (log.includes('[Signal')) tagColor = 'text-cyan-400';
              
              return (
                <div key={idx} className={`${tagColor} leading-relaxed break-all`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trace note */}
        <p className="text-[9px] text-slate-500 italic mt-3 font-mono">
          Note: Simulated requests are logged into the central database instantaneously. All dashboard sliders and counts adapt on incoming segments dynamically.
        </p>
      </div>

    </div>
  );
}
