import { dbInstance } from './db';
import { PerfAnalyticsEngine } from './analytics';

export class LiveTrafficSimulator {
  private timer: NodeJS.Timeout | null = null;
  private isSpikeActive: boolean = false;
  private spikeTimer: NodeJS.Timeout | null = null;

  private paths = ['/', '/dashboard', '/products', '/pricing', '/docs', '/checkout'];
  private sessions = Array.from({ length: 8 }, (_, i) => `sess-live-${i}`);
  private browsers = ['Chrome', 'Safari', 'Firefox', 'Chrome Mobile'];
  private devices: ('desktop' | 'mobile')[] = ['desktop', 'mobile'];

  public start() {
    if (this.timer) return;

    console.log('Live Metric Stream Simulator active. Injecting fake telemetry packets every 4.5 seconds...');
    
    // Core simulation tick
    this.timer = setInterval(() => {
      this.generateTelemetryPacket();
    }, 4500);

    // Schedule periodic traffic anomalies or spikes every 50 seconds to keep the alerts list fresh!
    this.spikeTimer = setInterval(() => {
      this.toggleSpikeSurge();
    }, 50000);
  }

  public stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.spikeTimer) clearInterval(this.spikeTimer);
    this.timer = null;
    this.spikeTimer = null;
  }

  private toggleSpikeSurge() {
    this.isSpikeActive = !this.isSpikeActive;
    console.log(`[Simulator Alert] Changing live simulator context. Spike active range set to: ${this.isSpikeActive}`);
    
    // If we started a spike, let's inject a critical crash
    if (this.isSpikeActive) {
      const pathsWithIssues = ['/pricing', '/checkout'];
      const errorMsg = "TypeError: Cannot read properties of null (reading 'amount') at StripePayTable (stripe-bundle-v4.js:124:45)";
      dbInstance.addError({
        sessionId: `sess-live-${Math.floor(Math.random() * 5)}`,
        message: errorMsg,
        source: "https://ais-dev-4uh.app/assets/stripe-bundle-v4.min.js",
        lineno: 124,
        colno: 45,
        path: pathsWithIssues[Math.floor(Math.random() * pathsWithIssues.length)],
        stack: `TypeError: ${errorMsg}\n    at renderPricing (stripe-bundle-v4.js:124:45)\n    at Object.mountPriceTable (pricing-v2.js:10:4)`
      });
    }
  }

  private generateTelemetryPacket() {
    const sessionId = this.sessions[Math.floor(Math.random() * this.sessions.length)];
    const path = this.paths[Math.floor(Math.random() * this.paths.length)];
    const device = this.devices[Math.floor(Math.random() * this.devices.length)];
    const browser = device === 'mobile' ? 'Chrome Mobile' : this.browsers[Math.floor(Math.random() * 3)];

    // Metric modeling with baseline drift
    let lcp = (device === 'mobile' ? 2100 : 1100) + (Math.random() * 300 - 150);
    let cls = Math.random() * 0.08;
    let inp = (device === 'mobile' ? 160 : 70) + (Math.random() * 40 - 20);
    let ttfb = 130 + Math.random() * 90;
    let apiLatency = 180 + Math.random() * 120;

    // Apply multiplier if stress spike is active
    if (this.isSpikeActive) {
      lcp *= 2.2;
      cls += 0.22;
      inp += 160;
      apiLatency *= 4;
      ttfb *= 2;
    }

    const fcp = ttfb + 150 + Math.random() * 200;
    const loadTime = lcp + 250 + Math.random() * 250;

    const metric = dbInstance.addMetric({
      sessionId,
      lcp: Math.round(lcp),
      cls: parseFloat(cls.toFixed(4)),
      inp: Math.round(inp),
      fcp: Math.round(fcp),
      ttfb: Math.round(ttfb),
      loadTime: Math.round(loadTime),
      apiLatency: Math.round(apiLatency),
      path,
      browser,
      device
    });

    // Feed new telemetry packet into analytics scan
    const triggeredAlert = PerfAnalyticsEngine.scanForAnomalies(metric);
    if (triggeredAlert) {
      console.log(`[Alert Engine] Triggered anomaly alert record: ${triggeredAlert.title}`);
    }

    // Occasionally trigger metric recommendations sync
    if (Math.random() < 0.25) {
      PerfAnalyticsEngine.triggerRecommendationEngine();
    }
  }
}

export const liveSimulator = new LiveTrafficSimulator();
