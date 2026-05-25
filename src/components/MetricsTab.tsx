import React, { useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  BarChart, 
  Bar 
} from 'recharts';
import { Clock, Eye, AlertTriangle, Monitor, Sparkles } from 'lucide-react';

export default function MetricsTab() {
  const { trends, summary } = useAnalytics();
  const [activeSegment, setActiveSegment] = useState<'lcp' | 'cls' | 'inp' | 'api' | 'load'>('lcp');

  if (trends.length === 0) {
    return (
      <div id="trends-loading-spinner" className="h-[400px] flex items-center justify-center border border-slate-800 rounded-2xl bg-slate-900/40">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-xs text-slate-400 font-mono">Assembling 12-hour trends model...</span>
        </div>
      </div>
    );
  }

  // Format custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-2xl font-mono text-[10px]">
          <p className="text-slate-400 font-semibold mb-1">Time: {label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color }} className="font-semibold">
              {p.name}: {p.value} {p.name.includes('LCP') || p.name.includes('INP') || p.name.includes('Time') || p.name.includes('Latency') ? 'ms' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const cwvThresholdRanges = {
    lcp: { target: 2500, metricName: 'Largest Contentful Paint (LCP) Trends', stroke: '#06b6d4', fill: 'url(#gradient-lcp)', dataKey: 'lcp', label: 'LCP (ms)', baseline: summary?.avgLcp || 1350 },
    cls: { target: 0.10, metricName: 'Cumulative Layout Shift (CLS) Stability', stroke: '#a855f7', fill: 'url(#gradient-cls)', dataKey: 'cls', label: 'CLS score', baseline: summary?.avgCls || 0.05 },
    inp: { target: 200, metricName: 'Interaction to Next Paint (INP) Input Speed', stroke: '#22c55e', fill: 'url(#gradient-inp)', dataKey: 'inp', label: 'INP (ms)', baseline: summary?.avgInp || 95 },
    api: { target: 500, metricName: 'Core API Network Call Latency Logs', stroke: '#eab308', fill: 'url(#gradient-api)', dataKey: 'apiLatency', label: 'Endpoint Latency (ms)', baseline: summary?.avgApiLatency || 240 },
    load: { target: 3000, metricName: 'Average Page Load Time Benchmarks', stroke: '#3b82f6', fill: 'url(#gradient-load)', dataKey: 'loadTime', label: 'Full Load Time (ms)', baseline: summary?.avgLoadTime || 1850 }
  };

  const activeConf = cwvThresholdRanges[activeSegment];

  return (
    <div id="metrics-tab-view" className="space-y-6">
      
      {/* Visual Navigation Tab Selector for Charts */}
      <div id="recharts-selectors-panel" className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 flex flex-wrap gap-1.5 relative overflow-hidden">
        {Object.entries(cwvThresholdRanges).map(([key, info]) => {
          const isSelected = activeSegment === key;
          return (
            <button
              key={key}
              onClick={() => setActiveSegment(key as any)}
              className={`flex-1 min-w-[124px] rounded-xl py-3 px-4 text-left transition-all duration-300 border cursor-pointer ${
                isSelected 
                  ? 'bg-slate-950/80 text-white border-slate-700/80 shadow-md shadow-slate-950/20' 
                  : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">
                {key} Metrics
              </span>
              <span className="text-xs font-bold font-sans mt-0.5 truncate block">
                Average {info.dataKey === 'apiLatency' ? 'API Latency' : key.toUpperCase()}
              </span>
              <span className="text-[11px] font-mono mt-1.5 block font-semibold" style={{ color: isSelected ? info.stroke : '#475569' }}>
                {info.baseline} {info.dataKey !== 'cls' ? 'ms' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Chart Dashboard Container */}
      <div id="recharts-data-visualization" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 space-y-4">
        
        {/* Graph Header details */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-tight flex items-center gap-1.5">
              <span>{activeConf.metricName}</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Historical averages segmented in 1-hour windows over last 12-hour period.</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded" style={{ backgroundColor: activeConf.stroke }}></span>
              <span className="text-slate-300">Measured Avg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-rose-500"></span>
              <span className="text-slate-300">Warning Threshold</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Frame */}
        <div className="h-[300px] w-full" id="area-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient-lcp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="gradient-cls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="gradient-inp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="gradient-api" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="gradient-load" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.35} vertical={false} />
              
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fill: '#64748b', fontSize: 9 }} 
                axisLine={false} 
                tickLine={false} 
                dy={8}
              />
              
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 9 }} 
                axisLine={false} 
                tickLine={false} 
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Highlight Target Threshold Line */}
              <Area 
                type="monotone" 
                dataKey={activeConf.dataKey} 
                name={activeConf.label}
                stroke={activeConf.stroke} 
                strokeWidth={2}
                fill={activeConf.fill} 
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Auxiliary Metrics Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Error Frequency Trend Chart */}
        <div id="metrics-js-errors-distribution" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-tight">JavaScript Exceptions Flow</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Aggregates of window.onerror crash events in telemetry segments.</p>
          </div>
          <div className="h-[180px] w-full" id="error-bar-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                <XAxis dataKey="timeLabel" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="errorsCount" name="JS Error Counts" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Load Distribution Chart */}
        <div id="metrics-sessions-traffic-frequency" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-tight">Active Telemetry Ingress Traffic</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Session metrics ingestion counts streamed into the Aetheris hub.</p>
          </div>
          <div className="h-[180px] w-full" id="traffic-line-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradient-traffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                <XAxis dataKey="timeLabel" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="trafficCount" name="Signal Packets" stroke="#4f46e5" strokeWidth={1.5} fill="url(#gradient-traffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
