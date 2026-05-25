import fs from 'fs';
import path from 'path';
import { PerformanceMetric, JSRuntimeError, PerfAlert, PerfRecommendation, SystemSummary, AnalyticsTrendPoint } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  metrics: PerformanceMetric[];
  errors: JSRuntimeError[];
  alerts: PerfAlert[];
  recommendations: PerfRecommendation[];
}

export class AnalyticsDB {
  private data: DatabaseSchema = {
    metrics: [],
    errors: [],
    alerts: [],
    recommendations: []
  };

  constructor() {
    this.load();
    if (this.data.metrics.length === 0) {
      console.log('Database empty, pre-populating historical monitoring logs...');
      this.populateMockHistory();
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        console.log(`Database loaded successfully. Records: Metrics[${this.data.metrics.length}], Alerts[${this.data.alerts.length}]`);
      }
    } catch (e) {
      console.error('Error loading database.json, starting fresh:', e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return this.data.metrics;
  }

  public addMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): PerformanceMetric {
    const newMetric: PerformanceMetric = {
      ...metric,
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.data.metrics.push(newMetric);
    
    // Cap memory size to last 5000 items
    if (this.data.metrics.length > 5000) {
      this.data.metrics.shift();
    }
    this.save();
    return newMetric;
  }

  public getErrors(): JSRuntimeError[] {
    return this.data.errors;
  }

  public addError(error: Omit<JSRuntimeError, 'id' | 'timestamp'>): JSRuntimeError {
    const newError: JSRuntimeError = {
      ...error,
      id: `err-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.data.errors.push(newError);
    if (this.data.errors.length > 500) {
      this.data.errors.shift();
    }
    this.save();
    return newError;
  }

  public getAlerts(): PerfAlert[] {
    return this.data.alerts;
  }

  public addAlert(alert: Omit<PerfAlert, 'id' | 'timestamp' | 'isResolved'>): PerfAlert {
    const newAlert: PerfAlert = {
      ...alert,
      id: `alt-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isResolved: false
    };
    this.data.alerts.unshift(newAlert); // Newest alert on top
    
    // Cap at 100 alerts
    if (this.data.alerts.length > 100) {
      this.data.alerts.pop();
    }
    this.save();
    return newAlert;
  }

  public resolveAlert(alertId: string) {
    const alert = this.data.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isResolved = true;
      this.save();
    }
  }

  public getRecommendations(): PerfRecommendation[] {
    return this.data.recommendations;
  }

  public addRecommendation(rec: Omit<PerfRecommendation, 'id' | 'timestamp'>): PerfRecommendation {
    const exists = this.data.recommendations.some(r => r.title === rec.title && r.rootCause === rec.rootCause);
    if (exists) {
      // Avoid duplicate recommendations
      return this.data.recommendations.find(r => r.title === rec.title)!;
    }

    const newRec: PerfRecommendation = {
      ...rec,
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    this.data.recommendations.unshift(newRec);
    this.save();
    return newRec;
  }

  public clearRecommendations() {
    this.data.recommendations = [];
    this.save();
  }

  // Populate 24 hours of simulated logs
  private populateMockHistory() {
    const now = new Date();
    const metrics: PerformanceMetric[] = [];
    const errors: JSRuntimeError[] = [];
    
    // We create active session IDs
    const sessions = Array.from({ length: 20 }, (_, i) => `sess-mock-${i}`);
    const paths = ['/', '/dashboard', '/products', '/pricing', '/docs', '/checkout'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Chrome Mobile', 'Edge'];
    const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'mobile', 'tablet'];

    // For 24 hours back, in 10-minute intervals
    for (let i = 144; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 10 * 60 * 1000);
      const hour = timestamp.getHours();
      
      // Traffic variation: peak traffic during 9:00 - 18:00
      let trafficMultiplier = 1;
      if (hour >= 9 && hour <= 18) {
        trafficMultiplier = 3 + Math.random() * 2;
      } else if (hour >= 0 && hour <= 5) {
        trafficMultiplier = 0.3 + Math.random() * 0.4;
      } else {
        trafficMultiplier = 1.2 + Math.random() * 1;
      }

      const activeSessCount = Math.max(1, Math.round(5 * trafficMultiplier));

      for (let s = 0; s < activeSessCount; s++) {
        const sessionId = sessions[s % sessions.length];
        const pathStr = paths[Math.floor(Math.random() * paths.length)];
        const dev = devices[s % 3];
        const browser = dev === 'mobile' ? 'Chrome Mobile' : browsers[Math.floor(Math.random() * 3)];

        // Generate metrics with some logic anomalies
        // LCP baseline: mobile 2200ms, desktop 1200ms
        let lcp = (dev === 'mobile' ? 2200 : 1200) + (Math.random() * 600 - 300);
        let cls = Math.random() * 0.12; 
        let inp = (dev === 'mobile' ? 180 : 80) + (Math.random() * 90 - 45);
        let ttfb = 150 + Math.random() * 110;
        let apiLatency = 200 + Math.random() * 250;

        // Introduce deterministic artificial periodic spike (say between 14:00 and 15:30)
        const hourFloat = hour + timestamp.getMinutes() / 60;
        if (hourFloat >= 14 && hourFloat <= 15.5) {
          lcp *= 1.8; // High LCP spike (regressions)
          apiLatency *= 2.5; // API Slowdown
          cls += 0.15; // Unstable layouts
        }

        // FCP is always slightly larger than TTFB and smaller than LCP
        const fcp = ttfb + 200 + Math.random() * 300;
        const loadTime = lcp + 300 + Math.random() * 400;

        metrics.push({
          id: `m-mock-${i}-${s}`,
          sessionId,
          timestamp: timestamp.toISOString(),
          lcp: Math.round(lcp),
          cls: parseFloat(cls.toFixed(4)),
          inp: Math.round(inp),
          fcp: Math.round(fcp),
          ttfb: Math.round(ttfb),
          loadTime: Math.round(loadTime),
          apiLatency: Math.round(apiLatency),
          path: pathStr,
          browser,
          device: dev
        });

        // 1.5% chance of JS runtime error during normal traffic, 5% during periodic spike
        const errorChance = (hourFloat >= 14 && hourFloat <= 15.5) ? 0.06 : 0.015;
        if (Math.random() < errorChance) {
          const errorMsg = [
            "Cannot read properties of undefined (reading 'map')",
            "NetworkError: Failed to fetch API resource /api/v1/pricing",
            "ReferenceError: analyticsTracker is not defined",
            "TypeError: Cannot convert undefined or null to object",
            "DOMException: Failed to execute 'querySelectorAll' on 'Document'"
          ][Math.floor(Math.random() * 5)];

          errors.push({
            id: `err-mock-${i}-${s}`,
            sessionId,
            timestamp: timestamp.toISOString(),
            message: errorMsg,
            source: `https://ais-dev-4uh.app/assets/index-${Math.floor(Math.random()*1000)}.js`,
            lineno: 140 + Math.floor(Math.random() * 500),
            colno: Math.floor(Math.random() * 80),
            path: pathStr,
            stack: `TypeError: ${errorMsg}\n    at renderProducts (index.js:145:22)\n    at onClick (dashboard.js:22:9)`
          });
        }
      }
    }

    this.data.metrics = metrics;
    this.data.errors = errors;

    // Prefill some structured Alerts
    this.data.alerts = [
      {
        id: "alt-mock-1",
        timestamp: new Date(now.getTime() - 1.5 * 3600 * 1000).toISOString(),
        title: "LCP Regression of 1.8x detected on Desktop viewport",
        metric: "LCP",
        severity: "critical",
        value: 2350,
        threshold: 1500,
        probableCause: "Oversized Hero Images and render-blocking main-header CSS script",
        confidence: 0.89,
        isResolved: false
      },
      {
        id: "alt-mock-2",
        timestamp: new Date(now.getTime() - 1.6 * 3600 * 1000).toISOString(),
        title: "API Latency Spike: /api/v1/inventory responses averages > 1000ms",
        metric: "LATENCY",
        severity: "warning",
        value: 1140,
        threshold: 500,
        probableCause: "High DB row locks and unindexed search predicate during user checkout traffic",
        confidence: 0.75,
        isResolved: false
      },
      {
        id: "alt-mock-3",
        timestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
        title: "CLS spike exceeding 0.25 (Layout Shift Regression)",
        metric: "CLS",
        severity: "warning",
        value: 0.28,
        threshold: 0.1,
        probableCause: "Dynamic promo banner injected without dimensions at top of /dashboard page",
        confidence: 0.94,
        isResolved: true
      },
      {
        id: "alt-mock-4",
        timestamp: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
        title: "High JS Runtime Error Rate surge in pricing segment",
        metric: "JS_ERROR",
        severity: "critical",
        value: 12,
        threshold: 2,
        probableCause: "TypeError crash inside Stripe pricing table mapping handler",
        confidence: 0.91,
        isResolved: false
      }
    ];

    // Prefill critical recommendations
    this.data.recommendations = [
      {
        id: "rec-mock-1",
        timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        title: "Serve hero visual banners in modern format (WEBP/AVIF)",
        description: "The primary banner image on / products has a file payload size of 1.4MB, which represents 60% of total LCP delay. Compress assets to under 150KB.",
        metric: "LCP",
        severity: "high",
        expectedImpact: "LCP decrease of ~850ms",
        rootCause: "Unoptimized oversized raw PNG assets",
        estimatedEffort: "easy",
        snippet: `<img \n  src="/images/hero_webp.webp" \n  srcset="/images/hero_webp_mobile.webp 600w, /images/hero_webp.webp 1200w" \n  loading="eager" \n  fetchpriority="high" \n/>`
      },
      {
        id: "rec-mock-2",
        timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        title: "Debounce input event listeners during product filter action",
        description: "Users typing in product searches generate excessive layout redraws, spiking Interaction to Next Paint (INP) to 320ms on mobile.",
        metric: "INP",
        severity: "high",
        expectedImpact: "INP input responsive speed increases by 65%",
        rootCause: "Unfiltered rapid on-keypress React state triggers",
        estimatedEffort: "medium",
        snippet: `import debounce from 'lodash/debounce';\n\nconst handleQueryChange = debounce((val) => {\n  setFilterQuery(val);\n}, 150);`
      },
      {
        id: "rec-mock-3",
        timestamp: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
        title: "Preload priority font scripts to avoid FCP/LCP blocks",
        description: "Global font file 'Inter' requires 400ms to resolve from Google Fonts CSS link in page head. Preload or save assets locally.",
        metric: "LCP",
        severity: "medium",
        expectedImpact: "First Content Paint improvement of 200ms",
        rootCause: "Late-discovered external font stylesheets",
        estimatedEffort: "easy",
        snippet: `<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />`
      },
      {
        id: "rec-mock-4",
        timestamp: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
        title: "Define explicit width/height parameters on layout elements",
        description: "Dynamically injected loading states and ad banners cause layout shifts, throwing CLS metrics from 0.05 to over 0.22.",
        metric: "CLS",
        severity: "high",
        expectedImpact: "Eliminates 90% of layout shifts during hydration",
        rootCause: "Dynamic visual components lacking placeholder sizes",
        estimatedEffort: "medium",
        snippet: `<div class="w-[300px] h-[250px] bg-slate-800 animate-pulse">\n  <!-- Ad banner loaded inside reserved bounds -->\n</div>`
      }
    ];

    this.save();
  }
}

export const dbInstance = new AnalyticsDB();
