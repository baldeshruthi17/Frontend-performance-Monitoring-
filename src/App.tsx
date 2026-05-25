import React from 'react';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import Sidebar from './components/Sidebar';
import StatisticsCards from './components/StatisticsCards';
import OverviewTab from './components/OverviewTab';
import MetricsTab from './components/MetricsTab';
import AlertsTab from './components/AlertsTab';
import RecommendationsTab from './components/RecommendationsTab';
import PlaygroundTab from './components/PlaygroundTab';
import GeminiAdvisorModal from './components/GeminiAdvisorModal';
import { Zap, ShieldAlert } from 'lucide-react';

function DashboardContent() {
  const { activeTab, isMockSpikeActive, summary } = useAnalytics();

  return (
    <div id="saas-app-root" className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <main id="main-content-pane" className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top bar header */}
        <header id="main-header" className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-100 font-sans tracking-tight">
              Observability Fleet Dashboard
            </h2>
            {isMockSpikeActive && (
              <span className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full text-[10px] text-rose-400 font-bold animate-pulse">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Live Regression Triggered
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>Workspace Server Securely Connected</span>
            </div>
          </div>
        </header>

        {/* Content scrolling grid */}
        <div id="content-scroll-container" className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Top statistics gauges block */}
          <StatisticsCards />

          {/* Dynamic Active Views */}
          <div id="dashboard-active-view-boundary" className="pt-2">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'metrics' && <MetricsTab />}
            {activeTab === 'alerts' && <AlertsTab />}
            {activeTab === 'recommendations' && <RecommendationsTab />}
            {activeTab === 'playground' && <PlaygroundTab />}
          </div>

        </div>

      </main>

      {/* Gemini Analysis overlay drawer */}
      <GeminiAdvisorModal />
    </div>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <DashboardContent />
    </AnalyticsProvider>
  );
}
