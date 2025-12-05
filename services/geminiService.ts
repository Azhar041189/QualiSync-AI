
import { GoogleGenAI } from "@google/genai";
import { AgentRole, OmniScanReport, SharedWorkflowContext, AgentResponse, SecurityVulnerability, PerformanceMetric, DatabaseCheck, GTMetrixReport, WaterfallRequest, HistoryPoint, StructureAudit, BrowserTimings } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  Output: "APPROVED" or "REJECTED: <Reason>"`,

  [AgentRole.HEALER]: `You are "The Healer" (Agent E).
  Goal: Fix runtime failures.
  UI: Vector Search for selectors.
  API: Analyze 4xx/5xx errors, auth failures. 
  Logic: If API 401, check Auth headers. If 404, check endpoint URL. If 429, suggest retry logic.
  Output: Healed Code.`,
  
  [AgentRole.SECURITY]: `You are "The Security Auditor".
  Goal: Identify OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF) based on context.
  Output: JSON array of Vulnerabilities with remediation code.`,
  
  [AgentRole.PERFORMANCE]: `You are "The Performance Engineer".
  Goal: Simulate Load Testing metrics (k6 style).
  Output: JSON array of time-series data (RPS, Latency).`
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
export const analyzeVisualDiff = async (ctx: string, b?: string|null, c?: string|null): Promise<any> => { return { hasRegression: false, description: "No diff" }; }

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
  for(let i=0; i<count; i++) {
     metrics.push({
         timestamp: `00:${String(i*3).padStart(2,'0')}`,
         virtualUsers: Math.floor(config.vus * (i/count)),
         rps: Math.floor(Math.random() * 500) + (i*50),
         latency: Math.floor(Math.random() * 100) + 50,
         errorRate: i > 15 ? 0.05 : 0.0
     });
  }
  return metrics;
};

export const runLighthouseSimulation = async (url: string): Promise<GTMetrixReport> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Analyze this URL for performance: "${url}".
    Generate a realistic "GTmetrix" style report JSON.
    Include grades (A-F), scores (0-100), Web Vitals (LCP, TBT, CLS), FCP, SI, TTI, and technical audit issues.
    
    REQUIRED JSON FORMAT:
    {
      "url": "${url}",
      "timestamp": "Now",
      "location": "Vancouver, Canada",
      "device": "Chrome (Desktop) 117.0",
      "gtmetrixGrade": "B",
      "performanceScore": 75,
      "structureScore": 82,
      "webVitals": {
         "lcp": { "name": "Largest Contentful Paint", "value": "1.4s", "score": 90, "rating": "Good" },
         "tbt": { "name": "Total Blocking Time", "value": "350ms", "score": 60, "rating": "Needs Improvement" },
         "cls": { "name": "Cumulative Layout Shift", "value": "0.02", "score": 95, "rating": "Good" }
      },
      "performanceMetrics": {
         "fcp": { "name": "First Contentful Paint", "value": "0.9s", "score": 95, "rating": "Good" },
         "si": { "name": "Speed Index", "value": "1.8s", "score": 85, "rating": "Good" },
         "tti": { "name": "Time to Interactive", "value": "2.1s", "score": 70, "rating": "Needs Improvement" }
      },
      "browserTimings": {
         "redirect": 0, "connect": 80, "backend": 120, "ttfb": 200, "domInteractive": 900, "domLoaded": 1100, "onload": 2100
      },
      "pageDetails": {
         "fullyLoadedTime": "2.1s",
         "totalPageSize": "1.8MB",
         "requests": 56
      },
      "topIssues": [
         { "priority": "High", "audit": "Reduce initial server response time", "impact": "600ms" }
      ]
    }
  `;

  try {
    const res = await ai.models.generateContent({
       model,
       contents: prompt,
       config: { responseMimeType: 'application/json' }
    });
    const baseReport = JSON.parse(res.text || "{}");

    // Augment with Waterfall Data
    const waterfall: WaterfallRequest[] = [
       { url: "/", method: "GET", status: 200, type: "html", size: "15KB", startTime: 0, duration: 150, segments: { dns: 20, ssl: 30, connect: 20, send: 10, wait: 50, receive: 20 } },
       { url: "/styles/main.css", method: "GET", status: 200, type: "css", size: "45KB", startTime: 160, duration: 120, segments: { dns: 0, ssl: 0, connect: 0, send: 5, wait: 80, receive: 35 } },
       { url: "/js/app.bundle.js", method: "GET", status: 200, type: "js", size: "120KB", startTime: 180, duration: 250, segments: { dns: 0, ssl: 0, connect: 0, send: 5, wait: 120, receive: 125 } },
       { url: "/assets/hero.jpg", method: "GET", status: 200, type: "image", size: "250KB", startTime: 250, duration: 400, segments: { dns: 10, ssl: 15, connect: 10, send: 5, wait: 150, receive: 210 } },
       { url: "/api/config", method: "GET", status: 200, type: "other", size: "2KB", startTime: 300, duration: 90, segments: { dns: 0, ssl: 0, connect: 0, send: 5, wait: 80, receive: 5 } },
       { url: "/fonts/inter.woff2", method: "GET", status: 200, type: "font", size: "30KB", startTime: 220, duration: 80, segments: { dns: 0, ssl: 0, connect: 0, send: 2, wait: 40, receive: 38 } },
       { url: "/js/analytics.js", method: "GET", status: 200, type: "js", size: "15KB", startTime: 500, duration: 100, segments: { dns: 10, ssl: 10, connect: 10, send: 5, wait: 40, receive: 25 } },
    ];

    const history: HistoryPoint[] = [
      { date: "Oct 1", performanceScore: 68, lcp: 2.1 },
      { date: "Oct 5", performanceScore: 72, lcp: 1.8 },
      { date: "Oct 10", performanceScore: 70, lcp: 1.9 },
      { date: "Oct 15", performanceScore: 75, lcp: 1.5 },
      { date: "Today", performanceScore: baseReport.performanceScore || 75, lcp: parseFloat(baseReport.webVitals?.lcp?.value) || 1.4 }
    ];

    const filmstrip = ["0.5s", "1.0s", "1.5s", "2.0s", "2.5s"];

    const structureAudits: StructureAudit[] = [
        { audit: "Eliminate render-blocking resources", severity: 'High', description: "Potential savings of 120ms by deferring unused CSS." },
        { audit: "Properly size images", severity: 'Medium', description: "Serve images that are appropriately-sized to save cellular data." },
        { audit: "Defer offscreen images", severity: 'Medium', description: "Consider lazy-loading offscreen and hidden images." },
        { audit: "Minify CSS", severity: 'Low', description: "Minifying CSS files can reduce network payload sizes." },
        { audit: "Minify JavaScript", severity: 'Low', description: "Minifying JavaScript files can reduce payload sizes and script parse time." }
    ];

    return { ...baseReport, waterfall, history, filmstrip, structureAudits };

  } catch (e) {
    return {
      url,
      timestamp: new Date().toISOString(),
      location: "San Antonio, USA",
      device: "Chrome (Desktop) 117.0",
      gtmetrixGrade: "C",
      performanceScore: 62,
      structureScore: 81,
      webVitals: {
         lcp: { name: "LCP", value: "2.5s", score: 60, rating: "Needs Improvement" },
         tbt: { name: "TBT", value: "520ms", score: 40, rating: "Poor" },
         cls: { name: "CLS", value: "0.15", score: 50, rating: "Needs Improvement" }
      },
      performanceMetrics: {
         fcp: { name: "FCP", value: "1.2s", "score": 80, rating: "Good" },
         si: { name: "Speed Index", value: "2.5s", "score": 60, rating: "Needs Improvement" },
         tti: { name: "TTI", value: "3.2s", "score": 50, rating: "Needs Improvement" }
      },
      browserTimings: { redirect: 0, connect: 100, backend: 200, ttfb: 300, domInteractive: 1200, domLoaded: 1500, onload: 3000 },
      pageDetails: { fullyLoadedTime: "4.5s", totalPageSize: "3.2MB", requests: 89 },
      topIssues: [{ priority: "High", audit: "Eliminate render-blocking resources", impact: "High" }],
      waterfall: [],
      history: [],
      filmstrip: ["0.5s", "1.0s", "1.5s"],
      structureAudits: []
    };
  }
};

export const runDatabaseVerification = async (config: any): Promise<DatabaseCheck[]> => {
    return [
        { table: "Users", checkType: "Schema", status: "Pass", details: "Column types match v2.1 spec" },
        { table: "Orders", checkType: "Integrity", status: "Pass", details: "Foreign keys valid" },
        { table: "Logs", checkType: "Performance", status: "Fail", details: "Index missing on 'created_at'" }
    ];
};

export const runOmniScan = async (url: string, selectedTests: string[]): Promise<OmniScanReport> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Target: """${url}"""
    Selected Tests: ${selectedTests.join(', ')}
    Generate realistic OmniScan Report JSON.

    IF "database" is selected:
    - Assume connection to the DB Context provided in Target (if any).
    - Generate checks for: Schema Compliance, Data Integrity (Foreign Keys), and CRUD Latency (Insert/Select).
    - Status can be "Healthy" or "Degraded".

    IF "api" is selected:
    - Generate realistic endpoint results with methods (GET, POST, etc).
    - Include Complex Scenarios: Auth (401), Rate Limiting (429), Data Validation.
    - Contract Test Code: Generate a Python pytest script that validates these endpoints.

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
      "accessibility": { "score": 85, "issues": [] },
      "brokenLinks": [ { "url": "/404", "status": 404, "sourcePage": "/home" } ],
      "database": { 
          "status": "Healthy", 
          "checks": [ 
             { "name": "Schema Validation (Users)", "status": "Pass", "latency": "12ms" },
             { "name": "FK Integrity (Orders)", "status": "Fail", "latency": "45ms" },
             { "name": "CRUD: Insert Log", "status": "Pass", "latency": "8ms" }
          ] 
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.4 }
    });
    const raw = response.text || "{}";
    const cleaned = raw.replace(/```json|```/g, '');
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON");
    return JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
  } catch (error) {
    console.error("OmniScan Failed:", error);
    throw new Error("Scan Generation Failed");
  }
};

export const runAccessibilityAudit = async (url: string): Promise<any> => { return runOmniScan(url, ['accessibility']); };
