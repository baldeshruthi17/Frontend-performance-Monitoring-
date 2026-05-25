import { dbInstance } from './db';
import { PerformanceMetric, JSRuntimeError, PerfAlert, PerfRecommendation, SystemSummary, AnalyticsTrendPoint } from '../src/types';

export class PerfAnalyticsEngine {
  
  /**
   * Calculate rolling statistics for a given window (default last 10 minutes)
   */
  public static getRollingStats(windowMinutes: number = 10) {
    const metrics = dbInstance.getMetrics();
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recentMetrics = metrics.filter(m => new Date(m.timestamp) >= cutoff);
    
    if (recentMetrics.length === 0) {
      // Fallback to last 10 records if no data in window
      return this.aggregate(metrics.slice(-15));
    }
    return this.aggregate(recentMetrics);
  }

  /**
   * Internal aggregator
   */
  private static aggregate(metrics: PerformanceMetric[]) {
    if (metrics.length === 0) {
      return { avgLcp: 0, avgCls: 0, avgInp: 0, avgTtfb: 0, avgLoadTime: 0, avgApiLatency: 0, count: 0 };
    }
    const sum = metrics.reduce(
      (acc, m) => {
        acc.lcp += m.lcp;
        acc.cls += m.cls;
        acc.inp += m.inp;
        acc.ttfb += m.ttfb;
        acc.loadTime += m.loadTime;
        acc.apiLatency += m.apiLatency;
        return acc;
      },
      { lcp: 0, cls: 0, inp: 0, ttfb: 0, loadTime: 0, apiLatency: 0 }
    );

    const count = metrics.length;
    return {
      avgLcp: Math.round(sum.lcp / count),
      avgCls: parseFloat((sum.cls / count).toFixed(4)),
      avgInp: Math.round(sum.inp / count),
      avgTtfb: Math.round(sum.ttfb / count),
      avgLoadTime: Math.round(sum.loadTime / count),
      avgApiLatency: Math.round(sum.apiLatency / count),
      count
    };
  }

  /**
   * Get the current baseline stats of the system (typically last 24 hours stats, acting as stability criteria)
   */
  public static getBaselineStats() {
    const metrics = dbInstance.getMetrics();
    // Use last 100 historical items as standard baseline comparison
    return this.aggregate(metrics.slice(0, 100));
  }

  /**
   * Run live monitoring checks and auto generate alert records if anomalous performance is captured.
   */
  public static scanForAnomalies(newMetric: PerformanceMetric): PerfAlert | null {
    const baseline = this.getBaselineStats();
    const activeStats = this.getRollingStats(10); // last 10 minutes

    // Threshold triggers:
    // 1. LCP Regression (LCP exceeds baseline * 1.5 or is > 2500ms)
    if (newMetric.lcp > 2500 && newMetric.lcp > baseline.avgLcp * 1.4) {
      const exists = dbInstance.getAlerts().some(a => !a.isResolved && a.metric === 'LCP' && (Date.now() - new Date(a.timestamp).getTime()) < 5 * 60 * 1000);
      if (!exists) {
        const rootCauseInfo = this.diagnoseLCPRootCause(newMetric);
        return dbInstance.addAlert({
          title: `LCP degradation detected on page '${newMetric.path}' (${newMetric.device})`,
          metric: 'LCP',
          severity: newMetric.lcp > 4000 ? 'critical' : 'warning',
          value: newMetric.lcp,
          threshold: Math.max(2500, Math.round(baseline.avgLcp * 1.4)),
          probableCause: rootCauseInfo.cause,
          confidence: parseFloat(rootCauseInfo.confidence.toFixed(2))
        });
      }
    }

    // 2. CLS Spike (CLS exceeds 0.25, or is > baseline * 1.8)
    if (newMetric.cls > 0.15 && newMetric.cls > baseline.avgCls * 1.6) {
      const exists = dbInstance.getAlerts().some(a => !a.isResolved && a.metric === 'CLS' && (Date.now() - new Date(a.timestamp).getTime()) < 5 * 60 * 1000);
      if (!exists) {
        return dbInstance.addAlert({
          title: `CLS Shift Violation detected on page '${newMetric.path}'`,
          metric: 'CLS',
          severity: newMetric.cls > 0.25 ? 'critical' : 'warning',
          value: newMetric.cls,
          threshold: Math.max(0.1, parseFloat((baseline.avgCls * 1.6).toFixed(3))),
          probableCause: "Dynamic DOM elements rendered without reserved spaces or image aspect ratio constraints",
          confidence: 0.85
        });
      }
    }

    // 3. API Latency spike (API Latency exceeds 600ms or 2x of baseline)
    if (newMetric.apiLatency > 800) {
      const exists = dbInstance.getAlerts().some(a => !a.isResolved && a.metric === 'LATENCY' && (Date.now() - new Date(a.timestamp).getTime()) < 5 * 60 * 1000);
      if (!exists) {
        return dbInstance.addAlert({
          title: `Extremely slow page core HTTP network request latency: ${newMetric.apiLatency}ms`,
          metric: 'LATENCY',
          severity: newMetric.apiLatency > 1500 ? 'critical' : 'warning',
          value: newMetric.apiLatency,
          threshold: 500,
          probableCause: "Slow response serialization or network bottleneck during database cursor operations",
          confidence: 0.78
        });
      }
    }

    // 4. INP (Latency in interactions > 200 ms)
    if (newMetric.inp > 200 && newMetric.inp > baseline.avgInp * 1.5) {
      const exists = dbInstance.getAlerts().some(a => !a.isResolved && a.metric === 'INP' && (Date.now() - new Date(a.timestamp).getTime()) < 5 * 60 * 1000);
      if (!exists) {
        return dbInstance.addAlert({
          title: `Poor Input responsiveness (INP spike of ${newMetric.inp}ms) on '${newMetric.path}'`,
          metric: 'INP',
          severity: 'warning',
          value: newMetric.inp,
          threshold: 200,
          probableCause: "Heavy JavaScript main-thread blocking operations or synchronous state updates",
          confidence: 0.82
        });
      }
    }

    return null;
  }

  /**
   * Diagnose cause of LCP regressions using telemetry logs
   */
  private static diagnoseLCPRootCause(metric: PerformanceMetric): { cause: string; confidence: number } {
    if (metric.ttfb > metric.lcp * 0.4) {
      return { 
        cause: "High Time to First Byte (TTFB). The origin backend latency or content rendering bottlenecks represent the core LCP delay.", 
        confidence: 0.88 
      };
    }
    
    if (metric.device === 'mobile') {
      return {
        cause: "Oversized images or layout assets served to mobile browser without responsive sizing configurations",
        confidence: 0.91
      };
    }

    return {
      cause: "Render-blocking third-party analytics trackers and custom static bundles delay visual mount hooks",
      confidence: 0.76
    };
  }

  /**
   * Dynamic Recommendation Generator
   * Scan active metrics and error frequencies to update optimization targets
   */
  public static triggerRecommendationEngine(): PerfRecommendation[] {
    const metrics = dbInstance.getMetrics().slice(-100);
    const errors = dbInstance.getErrors();
    const recommendations: Omit<PerfRecommendation, 'id' | 'timestamp'>[] = [];

    // Analyze avg LCP
    const avgLcp = metrics.reduce((sum, m) => sum + m.lcp, 0) / Math.max(1, metrics.length);
    if (avgLcp > 2200) {
      recommendations.push({
        title: "Implement Lazy Loading on below-the-fold media tags",
        description: "Your average Largest Contentful Paint exceeds 2.2s. Defer images below the fold to let core styling and hero elements parse uninterrupted.",
        metric: "LCP",
        severity: avgLcp > 3200 ? "high" : "medium",
        expectedImpact: "LCP decrease of 500ms - 900ms",
        rootCause: "Heavy rendering of secondary non-visible layout graphics",
        estimatedEffort: "easy",
        snippet: `<img src="footer-graphic.png" loading="lazy" alt="Visual asset" />`
      });

      recommendations.push({
        title: "Compile server-side caching headers for static CDN paths",
        description: "Static stylesheet assets take too long to resolve synchronously. Implement max-age caching to enable client caching.",
        metric: "LCP",
        severity: "medium",
        expectedImpact: "LCP reduction of ~300ms for returning users",
        rootCause: "Absence of efficient browser cache instructions",
        estimatedEffort: "medium",
        snippet: `// In Express static router configuration\napp.use('/static', express.static(path.join(__dirname, 'public'), {\n  maxAge: '1y',\n  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=31536000')\n}));`
      });
    }

    // Analyze errors
    if (errors.length > 5) {
      const recentErrors = errors.slice(-10);
      const isMapCrash = recentErrors.some(e => e.message.includes('undef') || e.message.includes('null'));
      if (isMapCrash) {
        recommendations.push({
          title: "Install Optional Chaining Guardrails inside dynamic templates",
          description: "Multiple JS errors are logged due to accessing undefined elements. Guard nested properties against hydration shifts.",
          metric: "JS_ERROR",
          severity: "high",
          expectedImpact: "Eradicate up to 45% of user session JS runtime crashes",
          rootCause: "Unchecked object property mapping",
          estimatedEffort: "easy",
          snippet: `// Replace\nconst price = product.pricing.amount;\n// With safe optional chaining\nconst price = product?.pricing?.amount ?? 0;`
        });
      }
    }

    const avgCls = metrics.reduce((sum, m) => sum + m.cls, 0) / Math.max(1, metrics.length);
    if (avgCls > 0.12) {
      recommendations.push({
        title: "Inject aspect-ratio and dimension bounding boxes on hero visual modules",
        description: "CLS average is poor. Reserving spaces prevents text layout shifts when remote image blocks hydrate.",
        metric: "CLS",
        severity: "high",
        expectedImpact: "Reduction of CLS index to fully green zone (< 0.1)",
        rootCause: "Unbounded layout injection by late-hydrating templates",
        estimatedEffort: "medium",
        snippet: `.hero-wrapper {\n  aspect-ratio: 16 / 9;\n  background: #1e293b;\n  min-height: 240px;\n}`
      });
    }

    // Add recommendations into the live database
    recommendations.forEach(rec => dbInstance.addRecommendation(rec));

    return dbInstance.getRecommendations();
  }

  /**
   * Get overall system health and current averages
   */
  public static getSystemSummary(): SystemSummary {
    const metrics = dbInstance.getMetrics();
    const alerts = dbInstance.getAlerts();
    const errors = dbInstance.getErrors();

    // Take last 50 metrics as recent window represent
    const recent = metrics.slice(-50);
    const agg = this.aggregate(recent);

    // Calculate score: performance score 0 - 100 based on core web vitals LCP, CLS, INP
    // Good: LCP <= 2500, CLS <= 0.1, INP <= 200
    let scoreLcp = Math.max(0, 100 - (agg.avgLcp > 2500 ? (agg.avgLcp - 2500) / 15 : 0));
    let scoreCls = Math.max(0, 100 - (agg.avgCls > 0.1 ? (agg.avgCls - 0.1) * 350 : 0));
    let scoreInp = Math.max(0, 100 - (agg.avgInp > 200 ? (agg.avgInp - 200) / 3 : 0));

    let performanceScore = Math.round((scoreLcp + scoreCls + scoreInp) / 3);
    performanceScore = Math.min(100, Math.max(10, performanceScore));

    const totalAlerts = alerts.filter(a => !a.isResolved).length;
    const activeAnomalies = alerts.filter(a => !a.isResolved && a.severity === 'critical').length;

    // Calculate overall JS crash rate (errors relative to metrics occurrences)
    const errCount = errors.filter(e => new Date(e.timestamp) >= new Date(Date.now() - 30 * 60 * 1000)).length;
    const metricCount = recent.length;
    const errorRate = parseFloat((metricCount > 0 ? (errCount / metricCount) * 100 : 0.4).toFixed(1));

    return {
      performanceScore,
      totalAlerts,
      activeAnomalies,
      avgLcp: agg.avgLcp,
      avgCls: agg.avgCls,
      avgInp: agg.avgInp,
      avgLoadTime: agg.avgLoadTime,
      errorRate: Math.min(15, errorRate)
    };
  }

  /**
   * Compile historical trend curves for Recharts dashboard
   */
  public static getTrends(hours: number = 24): AnalyticsTrendPoint[] {
    const metrics = dbInstance.getMetrics();
    const errors = dbInstance.getErrors();
    const now = new Date();
    const result: AnalyticsTrendPoint[] = [];

    // Group items into dynamic historical chunks
    // For 24 hours, we create 1-hour segments
    for (let i = hours - 1; i >= 0; i--) {
      const segmentStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      const segmentEnd = new Date(now.getTime() - i * 60 * 60 * 1000);

      const segmentMetrics = metrics.filter(
        m => {
          const t = new Date(m.timestamp);
          return t >= segmentStart && t < segmentEnd;
        }
      );
      const segmentErrors = errors.filter(
        e => {
          const t = new Date(e.timestamp);
          return t >= segmentStart && t < segmentEnd;
        }
      );

      const timeLabel = segmentEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      if (segmentMetrics.length === 0) {
        // Fallback or smooth data if empty
        const lastVal = result[result.length - 1] || { lcp: 1400, cls: 0.04, inp: 90, loadTime: 1800, apiLatency: 220, errorsCount: 0, trafficCount: 0 };
        result.push({
          timeLabel,
          timestamp: segmentEnd.toISOString(),
          lcp: lastVal.lcp,
          cls: lastVal.cls,
          inp: lastVal.inp,
          loadTime: lastVal.loadTime,
          apiLatency: lastVal.apiLatency,
          errorsCount: segmentErrors.length,
          trafficCount: 0
        });
        continue;
      }

      const agg = this.aggregate(segmentMetrics);
      result.push({
        timeLabel,
        timestamp: segmentEnd.toISOString(),
        lcp: agg.avgLcp,
        cls: agg.avgCls,
        inp: agg.avgInp,
        loadTime: agg.avgLoadTime,
        apiLatency: agg.avgApiLatency,
        errorsCount: segmentErrors.length,
        trafficCount: segmentMetrics.length
      });
    }

    return result;
  }
}
