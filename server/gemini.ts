import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client safely using the modern SDK pattern
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim().length > 0) {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log('Gemini API Client initialized successfully for Server-Side AI diagnostics.');
      } catch (e) {
        console.error('Failed to initialize Gemini Client:', e);
      }
    } else {
      console.log('Gemini API Key missing or default value detected. Running in Sandbox AI Simulation mode.');
    }
  }
  return aiClient;
}

export interface AIDiagnosisConfig {
  alertTitle: string;
  metric: string;
  value: number;
  probableCause: string;
  recentMetricsSummary: string;
  path?: string;
}

export async function generateAICauseDiagnosis(config: AIDiagnosisConfig): Promise<{
  analysis: string;
  fixSnippet: string;
  impactScore: string;
  suggestedSteps: string[];
}> {
  const prompt = `You are a Lead Frontend Performance Architect. Analyze the following browser telemetry degradation alert and generate an implementation-ready fix:

Alert Context:
- Triggered Alert: "${config.alertTitle}"
- Target Metric: ${config.metric} (Value: ${config.value})
- HEURISTIC DETECTED CAUSE: "${config.probableCause}"
- Recent telemetry aggregates: ${config.recentMetricsSummary}

Please respond in JSON format matching this schema:
{
  "analysis": "A detailed 2-paragraph root-cause analysis explaining why this occurs and what bottlenecks (network, main thread, sub-resource delivery) are involved.",
  "fixSnippet": "A concrete JavaScript / CSS / config code snippet showing how to implement the technical fix, with comments.",
  "impactScore": "Estimated performance gain (e.g. 'Highly Critical LCP impact, reduction of -1350ms expected')",
  "suggestedSteps": [
    "Step 1 to perform...",
    "Step 2 to perform...",
    "Step 3 to verify..."
  ]
}`;

  const client = getGeminiClient();

  if (client) {
    try {
      console.log(`[Gemini Request] Invoking gemini-3.5-flash for performance analysis on alert: ${config.alertTitle}`);
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an automated Site Reliability Engineer specializing in Google Chrome Web Vitals telemetry optimization. Be highly precise, brief, and supply real runnable boilerplate snippets in your JSON outputs."
        }
      });

      const responseText = response.text || "";
      const resultObj = JSON.parse(responseText.trim());
      return {
        analysis: resultObj.analysis || "No analysis returned from model.",
        fixSnippet: resultObj.fixSnippet || "// Code suggestion not supplied.",
        impactScore: resultObj.impactScore || "Medium severity improvement expected.",
        suggestedSteps: resultObj.suggestedSteps || ["Run visual metrics checks manually."]
      };
    } catch (e) {
      console.error('Gemini API call crashed, falling back to heuristic engine:', e);
    }
  }

  // Graceful Fallback Heuristic when key is not provided (Sandbox AI simulation)
  // Let's build specific, beautiful mock responses depending on the metric to mock real execution elegantly!
  return getSimulationFallbackResponse(config.metric, config.value, config.path || "");
}

function getSimulationFallbackResponse(metric: string, value: number, path?: string) {
  if (metric === "LCP") {
    return {
      analysis: `The telemetry analysis shows a critical regression in Largest Contentful Paint (LCP) clocking at ${value}ms. The primary culprit is the late discovery of the Hero Graphic node. By waiting for document parsing and hydration, your browser cannot request the resource until late in the frame cycle. Furthermore, the absence of 'fetchpriority="high"' tells the browser to queue this beneath minor styling files.`,
      fixSnippet: `<!-- Optimizing the primary LCP hero visual component -->\n<link \n  rel="preload" \n  href="/images/hero-marketing.webp" \n  as="image" \n  type="image/webp" \n  fetchpriority="high" \n/>\n\n<img \n  src="/images/hero-marketing.webp" \n  fetchpriority="high" \n  loading="eager" \n  alt="High Priority Banner" \n/>`,
      impactScore: "High LCP impact. Anticipated visual render latency decrease of ~400ms - 850ms.",
      suggestedSteps: [
        "Preload the hero content assets directly inside the early HTML index page.",
        "Add explicit fetchpriority='high' to the visual banner image element.",
        "Compress the underlying asset using modern WebP formats in CDNs."
      ]
    };
  }

  if (metric === "CLS") {
    return {
      analysis: `The layouts shifted considerably during page mount, resulting in a Cumulative Layout Shift (CLS) score of ${value}. The browser telemetry detected major element translation when the dynamic elements loaded at the top region. Because there is no fixed container set in CSS, the entire main text tree is shoved downward after the script hydrates.`,
      fixSnippet: `/* Reserve layout bounds for dynamic top cards */\n.promo-banner-container {\n  min-height: 80px;\n  background-color: var(--color-slate-900);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  aspect-ratio: 16 / 1;\n  content-visibility: auto;\n}`,
      impactScore: "Drastic layout stabilization. Expect CLS index restoration to green margins (< 0.05).",
      suggestedSteps: [
        "Wrap the dynamic banner or advertisements in structural bounding boxes with minimum height specified.",
        "Assign fixed aspect-ratio classes using Tailwind on custom visual grids.",
        "Prevent slow fonts from trigger FOUT layouts by setting font-display: swap."
      ]
    };
  }

  if (metric === "LATENCY") {
    return {
      analysis: `Backend HTTP transaction trace showed high endpoint latency averaging ${value}ms. Heavy JSON schema serialization and sequential database lookups on un-indexed rows block the server main event loop. By executing sequential await loops instead of parallel promises, the browser TTFB is severely degraded.`,
      fixSnippet: `// Standard optimized Express routing handler\napp.get('/api/analytics/trends', async (req, res) => {\n  // Run database inquiries in parallel to maximize IO throughput\n  const [metrics, alerts, configurations] = await Promise.all([\n    db.getMetricsAsync(),\n    db.getActiveAlertsAsync(),\n    config.getSystemSettings()\n  ]);\n  \n  res.set('Cache-Control', 'public, max-age=30');\n  res.json({ metrics, alerts, configurations });\n});`,
      impactScore: "Time to First Byte (TTFB) and API response time decrease of ~60%.",
      suggestedSteps: [
        "Combine independent slow await queries into a unified Promise.all call.",
        "Implement a Redis-backed read layer or memory-backed transient schema cache.",
        "Add an appropriate index to the timestamp columns inside the analytics schemas."
      ]
    };
  }

  // Default Fallback
  return {
    analysis: `Site performance monitoring engine flagged an anomaly with metric ${metric} exceeding threshold. Main execution threads are congested by concurrent scripting loops, delaying event listeners hookups for clicks and inputs.`,
    fixSnippet: `// Defer non-critical analytics tracker initialization\nwindow.addEventListener('load', () => {\n  setTimeout(() => {\n    initializeThirdPartySensors();\n  }, 2000);\n});`,
    impactScore: "Main thread hydration relief, reducing INP visual feedback loops.",
    suggestedSteps: [
      "Audit bundle size weights using Webpack analyzer plugin.",
      "Move computation-heavy helper parsers inside dedicated Web Workers.",
      "Debounce highly persistent inputs and layout-affecting resize observers."
    ]
  };
}
