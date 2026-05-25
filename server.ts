import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbInstance } from './server/db';
import { PerfAnalyticsEngine } from './server/analytics';
import { liveSimulator } from './server/generator';
import { generateAICauseDiagnosis } from './server/gemini';

// Automatically load environment parameters
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing parser middlewares
  app.use(express.json());

  // Automatically start simulated telemetry feed
  liveSimulator.start();

  // CORS headers integration for universal flexibility
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ==========================================
  // CORE API ENDPOINTS
  // ==========================================

  // 1. Diagnostics Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      agentSimulator: 'active'
    });
  });

  // 2. Metrics Telemetry List
  app.get('/api/metrics', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const device = req.query.device as string;
    const pathFilter = req.query.path as string;

    let list = dbInstance.getMetrics();

    if (device) {
      list = list.filter(m => m.device === device);
    }
    if (pathFilter) {
      list = list.filter(m => m.path === pathFilter);
    }

    // Return descending newest order
    res.json(list.slice(-limit).reverse());
  });

  // 3. System Highlights Summary (scores, averages, active states)
  app.get('/api/metrics/summary', (req: Request, res: Response) => {
    const summary = PerfAnalyticsEngine.getSystemSummary();
    res.json(summary);
  });

  // 4. JS Error Capture Log
  app.get('/api/errors', (req: Request, res: Response) => {
    const errors = dbInstance.getErrors();
    res.json(errors.slice(-50).reverse());
  });

  // 5. Active Alerts Dashboard
  app.get('/api/alerts', (req: Request, res: Response) => {
    const alerts = dbInstance.getAlerts();
    res.json(alerts);
  });

  // 6. Action: Resolve Alert
  app.post('/api/alerts/resolve/:id', (req: Request, res: Response) => {
    const alertId = req.params.id;
    dbInstance.resolveAlert(alertId);
    res.json({ success: true, message: `Alert ${alertId} flagged as resolved successfully.` });
  });

  // 7. Auto Recommendations Engine Suggestions
  app.get('/api/recommendations', (req: Request, res: Response) => {
    // Re-verify conditions on call
    const recs = PerfAnalyticsEngine.triggerRecommendationEngine();
    res.json(recs);
  });

  // 8. Trends and Chart Aggregation (last hours)
  app.get('/api/analytics/trends', (req: Request, res: Response) => {
    const hours = parseInt(req.query.hours as string) || 24;
    const trends = PerfAnalyticsEngine.getTrends(hours);
    res.json(trends);
  });

  // 9. Root Cause AI Deep-Analyzer (Powered by Gemini)
  app.post('/api/insights/analyze', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { alertTitle, metric, value, probableCause } = req.body;
      if (!alertTitle || !metric) {
        res.status(400).json({ error: 'Missing alert context details (title, metric, value).' });
        return;
      }

      // Compile current system statistics summary as extra analytical prompt parameters
      const recent = PerfAnalyticsEngine.getRollingStats(15);
      const summaryLabel = `Rolling averages - LCP: ${recent.avgLcp}ms, CLS: ${recent.avgCls}, INP: ${recent.avgInp}ms, Errors: ${recent.avgTtfb}ms`;

      console.log(`[AI endpoint] Querying AI diagnosis context for alert: ${alertTitle}`);
      const diagnosis = await generateAICauseDiagnosis({
        alertTitle,
        metric,
        value: parseFloat(value) || 0,
        probableCause: probableCause || 'Unverified anomaly trigger.',
        recentMetricsSummary: summaryLabel
      });

      res.json(diagnosis);
    } catch (err) {
      next(err);
    }
  });

  // 10. Client Telemetry Ingest (Real Web-Vitals flow sent by the client iframe itself!)
  app.post('/api/metrics/report', (req: Request, res: Response) => {
    const { lcp, cls, inp, fcp, ttfb, loadTime, apiLatency, path: pagePath, browser, device, sessionId } = req.body;

    if (!lcp && !cls && !inp) {
      res.status(400).json({ error: "Missing telemetry measurements." });
      return;
    }

    const metric = dbInstance.addMetric({
      sessionId: sessionId || `web-client-${Math.random().toString(36).substr(2, 6)}`,
      lcp: Math.round(lcp || 1200),
      cls: parseFloat(cls || 0.0),
      inp: Math.round(inp || 80),
      fcp: Math.round(fcp || 800),
      ttfb: Math.round(ttfb || 150),
      loadTime: Math.round(loadTime || 1400),
      apiLatency: Math.round(apiLatency || 200),
      path: pagePath || '/',
      browser: browser || 'Unknown Browser',
      device: device || 'desktop'
    });

    // Feed client packet into anomaly engine
    const alert = PerfAnalyticsEngine.scanForAnomalies(metric);

    res.json({
      success: true,
      data: metric,
      alertGenerated: alert ? alert.title : null
    });
  });

  // ==========================================
  // VITE BUNDLE MIDDLEWARE / STATIC SERVE
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    console.log('Enabling development Vite assets server on Express routing...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Production mode detected. Serving static production files from dist/...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error logging middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Server Exception:', err);
    res.status(500).json({
      error: 'Triggered unhandled server exception',
      details: err?.message || String(err)
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 FRONTEND PERFORMANCE MONITORING APLET HOSTED LIVE`);
    console.log(`   Local Server Access: http://localhost:${PORT}`);
    console.log(`   Telemetry Ingestion: POST http://localhost:${PORT}/api/metrics/report`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error("Critical server crash on initialization:", err);
});
