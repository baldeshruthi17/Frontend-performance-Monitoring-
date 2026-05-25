// Unified Type Declarations for Frontend/Backend Contract

export interface PerformanceMetric {
  id: string;
  sessionId: string;
  timestamp: string;
  lcp: number;      // Largest Contentful Paint (ms)
  cls: number;      // Cumulative Layout Shift
  inp: number;      // Interaction to Next Paint (ms)
  fcp: number;      // First Contentful Paint (ms)
  ttfb: number;     // Time to First Byte (ms)
  loadTime: number; // Total Page Load Time (ms)
  apiLatency: number; // API latency (ms)
  path: string;       // Page path / route
  browser: string;
  device: 'desktop' | 'mobile' | 'tablet';
}

export interface JSRuntimeError {
  id: string;
  sessionId: string;
  timestamp: string;
  message: string;
  source: string;
  lineno: number;
  colno: number;
  stack?: string;
  path: string;
}

export interface PerfAlert {
  id: string;
  timestamp: string;
  title: string;
  metric: 'LCP' | 'CLS' | 'INP' | 'JS_ERROR' | 'LATENCY' | 'LOAD_TIME';
  severity: 'info' | 'warning' | 'critical';
  value: number;
  threshold: number;
  probableCause: string;
  confidence: number;
  isResolved: boolean;
}

export interface PerfRecommendation {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  metric: 'LCP' | 'CLS' | 'INP' | 'JS_ERROR' | 'LATENCY';
  severity: 'low' | 'medium' | 'high';
  expectedImpact: string;
  rootCause: string;
  estimatedEffort: 'easy' | 'medium' | 'hard';
  snippet?: string;  // Fix code snippet suggest
}

export interface SystemSummary {
  performanceScore: number; // 0 - 100
  totalAlerts: number;
  activeAnomalies: number;
  avgLcp: number;
  avgCls: number;
  avgInp: number;
  avgLoadTime: number;
  errorRate: number; // %
}

export interface AnalyticsTrendPoint {
  timeLabel: string; // e.g., "14:00" or "Monday"
  timestamp: string;
  lcp: number;
  cls: number;
  inp: number;
  loadTime: number;
  apiLatency: number;
  errorsCount: number;
  trafficCount: number;
}
