import { GoogleGenAI } from "@google/genai";
import { AgentRole, OmniScanReport, SharedWorkflowContext, AgentResponse, SecurityVulnerability, PerformanceMetric, DatabaseCheck, GTMetrixReport, WaterfallRequest, HistoryPoint, StructureAudit, BrowserTimings } from '../types';

// Ensure API key is present or fail gracefully
const apiKey = process.env.API_KEY || 'demo-key';
const ai = new GoogleGenAI({ apiKey });

// System instructions for each agent persona
const PROMPTS = {
  [AgentRole.ANALYST]: `You are "The Analyst" (Agent A).
  Goal: Parse user stories into Gherkin Features. Identify edge cases.
  Output: Clean Gherkin text.`,

  [AgentRole.ARCHITECT]: `You are "The Architect" (Agent B).
  Goal: Design Test Strategy (UI vs API, Data Mocks, Design Patterns).
  Output: Technical Strategy Document.`,

  [AgentRole.CODER]: `You are "The Coder" (Agent C).
  Goal: Write Playwright/Python code.
  Rule: If no feedback, use time.sleep(5) (to demo Critic). If feedback exists, FIX IT.
  Output: Python Code Block.`,

  [AgentRole.CRITIC]: `You are "The Critic" (Agent D).
  Goal: Code Review.
  Rules:
  1. REJECT 'time.sleep'.
  2. REJECT weak locators (XPath).
  3. API: Enforce AAA pattern, Status Code assertions, Schema Validation.
  4. API: Enforce explicit error handling (try/except).
  5. API: Ensure descriptive assertion failure messages.
  6. Output: "APPROVED" or "REJECTED: <Reason>"`,

  [AgentRole.HEALER]: `You are "The Healer" (Agent E).
  Goal: Fix runtime failures.
  UI: Vector Search for selectors.
  API: Analyze 4xx/5xx errors, auth failures. 
  Logic: If API 401, check Auth headers. If 404, check endpoint URL. If 429, suggest retry logic.
  Output: Healed Code.`,

  [AgentRole.SECURITY]: `You are "The Security Auditor".
  Goal: Analyze the provided Python/Playwright code for security flaws.
  Checks: Hardcoded credentials, insecure HTTP usage, potential XSS injection vectors in inputs.
  Output: "Security Scan Passed" or a list of vulnerabilities found.`,

  [AgentRole.PERFORMANCE]: `You are "The Performance Engineer".
  Goal: Analyze the test script for performance bottlenecks.
  Checks: Excessive waits, unoptimized selectors, repeated network calls.
  Output: "Performance Optimized" or a list of optimization suggestions.`,

  [AgentRole.ACCESSIBILITY]: `You are "The A11y Coach".
  Goal: Ensure the test code verifies accessibility.
  Checks: Does the test check for 'alt' tags? Does it verify ARIA labels?
  Output: "A11y Checks Validated" or "Warning: Missing accessibility assertions."`
};

const buildAgentPrompt = (role: AgentRole, context: SharedWorkflowContext): string => {
  let prompt = `--- [USER STORY] ---\n${context.userStory}\n\n`;

  if (role === AgentRole.ARCHITECT) {
    prompt += `--- [ANALYST OUTPUT] ---\n${context.gherkinScenarios}\nTask: Design test strategy.`;
  }
  else if (role === AgentRole.CODER) {
    prompt += `--- [STRATEGY] ---\n${context.testStrategy}\n`;
    if (context.criticFeedback) {
      prompt += `--- [CRITIC FEEDBACK (MUST FIX)] ---\n${context.criticFeedback}\n--- [PREVIOUS CODE] ---\n${context.currentCode}\n`;
    }
    prompt += `Task: Write/Fix the Playwright Python code.`;
  }
  else if (role === AgentRole.CRITIC) {
    prompt += `--- [STRATEGY] ---\n${context.testStrategy}\n--- [CODE] ---\n${context.currentCode}\nTask: Review code.`;
  }
  else if (role === AgentRole.HEALER) {
    prompt += `--- [BROKEN CODE] ---\n${context.currentCode}\n--- [ERROR] ---\n${context.runtimeError}\nTask: Heal the code.`;
  }
  else if (role === AgentRole.SECURITY || role === AgentRole.PERFORMANCE || role === AgentRole.ACCESSIBILITY) {
    prompt += `--- [FINAL CODE] ---\n${context.currentCode}\nTask: Run specialized audit.`;
  }
  return prompt;
};

export const runAgentSimulation = async (role: AgentRole, context: SharedWorkflowContext): Promise<AgentResponse> => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = PROMPTS[role] || "You are a QA Agent.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: buildAgentPrompt(role, context),
      config: { systemInstruction, temperature: role === AgentRole.CODER ? 0.1 : 0.4 }
    });

    const text = response.text || "Agent failed.";
    const codeMatch = text.match(/```(?:python|gherkin|typescript)?\s*([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : undefined;

    let status: 'APPROVED' | 'REJECTED' | undefined;
    if (role === AgentRole.CRITIC) {
      status = text.toUpperCase().includes("REJECTED") ? 'REJECTED' : 'APPROVED';
    }

    return { text: text.replace(/```[\s\S]*?```/g, '').trim(), code, status };
  } catch (error) {
    console.error(`Error in ${role}:`, error);
    return { text: "Processing error.", code: undefined };
  }
};

export const healCode = async (brokenCode: string, errorContext: string, type: 'api' | 'ui'): Promise<string> => {
  const context: SharedWorkflowContext = { userStory: "Fix broken script", currentCode: brokenCode, runtimeError: errorContext };
  const response = await runAgentSimulation(AgentRole.HEALER, context);
  return response.code || brokenCode;
};

export const generateCodeFromVideoEvents = async (events: string[]): Promise<string> => { return "print('Simulated Code')"; }
export const generateAutomationCode = async (ctx: string, steps: string[], fw: string): Promise<string> => { return "print('Simulated Code')"; }
export const generateSyntheticData = async (schema: string, count: number, type: string): Promise<string> => { return "[]"; }
export const analyzeVisualDiff = async (ctx: string, b?: string | null, c?: string | null): Promise<any> => { return { hasRegression: false, description: "No diff" }; }

export const runSecurityAudit = async (url: string): Promise<SecurityVulnerability[]> => {
  const model = 'gemini-2.5-flash';
  const prompt = `Target: ${url}. List 3-5 potential OWASP vulnerabilities. Return JSON: [{id, name, severity, description, remediationCode}].`;
  try {
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction: PROMPTS[AgentRole.SECURITY], responseMimeType: 'application/json' }
    });
    return JSON.parse(res.text || "[]");
  } catch (e) { return []; }
};

export const runPerformanceSimulation = async (config: { vus: number, duration: string }): Promise<PerformanceMetric[]> => {
  const count = 20;
  const metrics: PerformanceMetric[] = [];
  for (let i = 0; i < count; i++) {
    metrics.push({
      timestamp: `00:${String(i * 3).padStart(2, '0')}`,
      virtualUsers: Math.floor(config.vus * (i / count)),
      rps: Math.floor(Math.random() * 500) + (i * 50),
      latency: Math.floor(Math.random() * 100) + 50,
      errorRate: i > 15 ? 0.05 : 0.0
    });
  }
  return metrics;
};

export const runLighthouseSimulation = async (url: string): Promise<GTMetrixReport> => {
  try {
    // Reuse the main engine
    const omniResult = await runOmniScan(url, ['lighthouse']);

    // Check if we have valid lighthouse data
    const lh = omniResult.lighthouse || {
      scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
      metrics: { lcp: '0s', fcp: '0s', cls: '0', tbt: '0ms' },
      audits: []
    };

    // Construct GTMetrix-style report
    const report: GTMetrixReport = {
      url,
      timestamp: new Date().toISOString(),
      location: "Vancouver, Canada", // Simulation default
      device: "Chrome (Desktop) 117.0",
      gtmetrixGrade: lh.scores.performance > 90 ? "A" : lh.scores.performance > 80 ? "B" : "C",
      performanceScore: lh.scores.performance,
      structureScore: lh.scores.bestPractices,
      webVitals: {
        lcp: { name: "LCP", value: lh.metrics.lcp, score: 90, rating: "Good" },
        tbt: { name: "TBT", value: lh.metrics.tbt, score: 85, rating: "Good" },
        cls: { name: "CLS", value: lh.metrics.cls, score: 95, rating: "Good" }
      },
      performanceMetrics: {
        fcp: { name: "FCP", value: lh.metrics.fcp, score: 92, rating: "Good" },
        si: { name: "SI", value: "1.2s", score: 88, rating: "Good" },
        tti: { name: "TTI", value: "1.5s", score: 85, rating: "Good" }
      },
      browserTimings: {
        redirect: 50, connect: 80, backend: 120, ttfb: 200, domInteractive: 800, domLoaded: 1200, onload: 1800
      },
      pageDetails: {
        fullyLoadedTime: "2.1s",
        totalPageSize: "1.8MB",
        requests: 45
      },
      topIssues: lh.audits.map(audit => ({
        priority: "Med" as const,
        audit: audit,
        impact: "Potential savings of ~150ms"
      })).slice(0, 5),
      waterfall: [
        { url: "/", method: "GET", status: 200, type: "html", size: "15KB", startTime: 0, duration: 250, segments: { dns: 20, ssl: 50, connect: 30, send: 5, wait: 120, receive: 25 } },
        { url: "/assets/main.js", method: "GET", status: 200, type: "js", size: "150KB", startTime: 255, duration: 120, segments: { dns: 0, ssl: 0, connect: 0, send: 2, wait: 80, receive: 38 } },
        { url: "/assets/style.css", method: "GET", status: 200, type: "css", size: "45KB", startTime: 260, duration: 80, segments: { dns: 0, ssl: 0, connect: 0, send: 2, wait: 50, receive: 28 } }
      ],
      history: [
        { date: "2023-11-01", performanceScore: 82, lcp: 1.5 },
        { date: "2023-11-08", performanceScore: 85, lcp: 1.4 },
        { date: "2023-11-15", performanceScore: 88, lcp: 1.2 }
      ],
      filmstrip: [],
      structureAudits: []
    };
    return report;
  } catch (error) {
    console.error("Lighthouse Sim Error:", error);
    throw error;
  }
};

export const runDatabaseVerification = async (config: any): Promise<DatabaseCheck[]> => {
  return [
    { table: "Users", checkType: "Schema", status: "Pass", details: "Column types match v2.1 spec" },
    { table: "Orders", checkType: "Integrity", status: "Pass", details: "Foreign keys valid" },
    { table: "Logs", checkType: "Performance", status: "Fail", details: "Index missing on 'created_at'" }
  ];
};

const fetchRealPageSpeedMetrics = async (url: string, apiKey?: string): Promise<any> => {
  try {
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;
    if (apiKey) {
      apiUrl += `&key=${apiKey}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`PSI API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("PSI Fetch Error:", error);
    return null;
  }
};

export const runOmniScan = async (url: string, selectedTests: string[], apiKey?: string): Promise<OmniScanReport> => {
  // Use dynamic key (User provided > Env > Demo)
  const effectiveKey = apiKey || process.env.API_KEY || 'demo-key';
  const genAI = new GoogleGenAI({ apiKey: effectiveKey });
  const model = 'gemini-2.5-flash';

  // 1. Fetch Real Data if Lighthouse/Load is selected (PSI covers these areas)
  let realData: any = null;
  if (selectedTests.includes('lighthouse') || selectedTests.includes('accessibility') || selectedTests.includes('load')) {
    realData = await fetchRealPageSpeedMetrics(url, apiKey);
  }


  // 2. Prepare Context for AI
  let realDataSummary = "";
  let psiScores = { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
  let psiMetrics = { lcp: "-", fcp: "-", cls: "-", tbt: "-" };
  let psiAudits: string[] = [];

  if (realData && realData.lighthouseResult) {
    const cats = realData.lighthouseResult.categories;
    const audits = realData.lighthouseResult.audits;

    psiScores = {
      performance: Math.round((cats.performance?.score || 0) * 100),
      accessibility: Math.round((cats.accessibility?.score || 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
      seo: Math.round((cats.seo?.score || 0) * 100)
    };

    psiMetrics = {
      lcp: audits['largest-contentful-paint']?.displayValue || "-",
      fcp: audits['first-contentful-paint']?.displayValue || "-",
      cls: audits['cumulative-layout-shift']?.displayValue || "-",
      tbt: audits['total-blocking-time']?.displayValue || "-"
    };

    // Extract failed audits
    const relevantAudits = ['uses-optimized-images', 'unused-javascript', 'render-blocking-resources', 'viewport'];
    psiAudits = relevantAudits.map(k => audits[k]).filter(a => a && a.score < 1).map(a => a.title);

    // Extract CrUX (Field Data) if available
    let cruxSummary = "";
    if (realData.loadingExperience && realData.loadingExperience.metrics) {
      const m = realData.loadingExperience.metrics;
      const getCat = (metric: any) => metric?.category || "N/A";
      cruxSummary = `
        FIELD_DATA (CrUX - Real Users):
        - FCP: ${getCat(m.FIRST_CONTENTFUL_PAINT_MS)} 
        - LCP: ${getCat(m.LARGEST_CONTENTFUL_PAINT_MS)}
        - CLS: ${getCat(m.CUMULATIVE_LAYOUT_SHIFT_SCORE)}
        - INP: ${getCat(m.INTERACTION_TO_NEXT_PAINT)}
        `;
      psiAudits.push(`Field Data: LCP is ${getCat(m.LARGEST_CONTENTFUL_PAINT_MS)}`);
      psiAudits.push(`Field Data: INP is ${getCat(m.INTERACTION_TO_NEXT_PAINT)}`);
    }

    if (psiAudits.length === 0) psiAudits = ["No significant performance issues found."];

    realDataSummary = `
      REAL_DATA_FROM_PAGESPEED_API:
      - Performance: ${psiScores.performance}
      - Accessibility: ${psiScores.accessibility}
      - SEO: ${psiScores.seo}
      - LCP: ${psiMetrics.lcp}
      - FCP: ${psiMetrics.fcp}
      - CLS: ${psiMetrics.cls}
      ${cruxSummary}
      `;
  }

  const prompt = `
    Target: """${url}"""
    Selected Tests: ${selectedTests.join(', ')}
    ${realDataSummary}

    Generate realistic OmniScan Report JSON.
    
    IMPORTANT: USE THE REAL DATA PROVIDED ABOVE for the 'lighthouse' and 'accessibility' sections. Do NOT hallucinate scores if real data is present.
    If real data is MISSING (e.g. API failed), generate realistic mock data.

    IF "database" is selected:
    - Assume connection to the DB Context provided in Target (if any).
    - Generate checks for: Schema Compliance, Data Integrity (Foreign Keys), and CRUD Latency (Insert/Select).
    - Status can be "Healthy" or "Degraded".

    IF "api" is selected:
    - Generate realistic endpoint results with methods (GET, POST, etc).
    - Include Complex Scenarios: Auth (401), Rate Limiting (429), Data Validation.
    - Contract Test Code: Generate a Python pytest script that validates these endpoints.

    IF "lighthouse" or "load" is selected:
    - Use provided PSI metrics.
    - Load: Simulated as PSI doesn't provide load testing (hallucinate realistic load data).

    REQUIRED JSON STRUCTURE:
    {
      "url": "Target",
      "score": <0-100>,
      "timestamp": "ISO Date",
      "api": [
        { "method": "GET", "endpoint": "/api/v1/resource", "status": 200, "latency": 120, "passed": true }
      ],
      "contractTestCode": "# Python pytest script...",
      "load": { "virtualUsers": 500, "rps": 1200, "p95Latency": 350, "errorRate": 0.02, "chartData": [{"time": "00:00", "rps": 100, "latency": 50}] },
      "security": [ { "severity": "High", "type": "SQL Injection", "description": "...", "remediation": "..." } ],
      "accessibility": { "score": ${realData ? psiScores.accessibility : 85}, "issues": [] },
      "brokenLinks": [ { "url": "/404", "status": 404, "sourcePage": "/home" } ],
      "database": { 
          "status": "Healthy", 
          "checks": [ 
             { "name": "Schema Validation (Users)", "status": "Pass", "latency": "12ms" },
             { "name": "FK Integrity (Orders)", "status": "Fail", "latency": "45ms" },
             { "name": "CRUD: Insert Log", "status": "Pass", "latency": "8ms" }
          ] 
      },
      "lighthouse": {
         "scores": { "performance": ${realData ? psiScores.performance : 85}, "accessibility": ${realData ? psiScores.accessibility : 92}, "bestPractices": ${realData ? psiScores.bestPractices : 88}, "seo": ${realData ? psiScores.seo : 95} },
         "metrics": { "lcp": "${realData ? psiMetrics.lcp : "1.2s"}", "fcp": "${realData ? psiMetrics.fcp : "0.8s"}", "cls": "${realData ? psiMetrics.cls : "0.01"}", "tbt": "${realData ? psiMetrics.tbt : "120ms"}" },
         "audits": ${JSON.stringify(realData ? psiAudits : ["Reduce unused JavaScript", "Serve images in next-gen formats"])}
      }
    }
  `;

  // Default structure to prevent undefined crashes
  const DEFAULT_REPORT: OmniScanReport = {
    url,
    score: psiScores.performance || 88,
    timestamp: new Date().toISOString(),
    api: [],
    load: { virtualUsers: 0, rps: 0, p95Latency: 0, errorRate: 0, chartData: [{ time: "0", rps: 0, latency: 0 }] },
    security: [],
    accessibility: { score: psiScores.accessibility || 0, issues: [] },
    brokenLinks: [],
    database: { status: 'Healthy', checks: [] },
    lighthouse: {
      scores: psiScores,
      metrics: psiMetrics,
      audits: psiAudits
    }
  };

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.4 }
    });
    const raw = response.text || "{}";
    const cleaned = raw.replace(/```json|```/g, '');
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON");

    const parsed = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));

    // Force merge real data over hallucinated data just in case LLM ignored instructions
    if (realData) {
      if (!parsed.lighthouse) parsed.lighthouse = {};
      parsed.lighthouse.scores = psiScores;
      parsed.lighthouse.metrics = psiMetrics;
      if (psiAudits.length > 0) parsed.lighthouse.audits = psiAudits;
      if (!parsed.accessibility) parsed.accessibility = {};
      parsed.accessibility.score = psiScores.accessibility;
    }

    return { ...DEFAULT_REPORT, ...parsed }; // Merge safe defaults
  } catch (error: any) {
    console.error("OmniScan AI Failed, utilizing fallback", error);

    // Fallback: If AI failed but we have Real PSI Data, return that!
    if (realData) {
      return {
        ...DEFAULT_REPORT,
        score: psiScores.performance || 0,
        lighthouse: {
          scores: psiScores,
          metrics: psiMetrics,
          audits: psiAudits
        },
        accessibility: { score: psiScores.accessibility || 0, issues: [] },
        // Inform user that AI analysis is missing but data is real
        api: [{ method: "GET", endpoint: `AI Analysis Unavailable (${error.message || "403"}), showing raw PSI data.`, status: 206, latency: 0, passed: true }]
      };
    }

    return {
      ...DEFAULT_REPORT,
      score: 0,
      api: [{ method: "GET", endpoint: `Scan Failed: ${error.message || String(error)}`, status: 500, latency: 0, passed: false }]
    };
  }
};

export const runAccessibilityAudit = async (url: string): Promise<any> => { return runOmniScan(url, ['accessibility']); };