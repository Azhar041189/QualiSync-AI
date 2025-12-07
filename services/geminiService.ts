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
  Output: "APPROVED" or "REJECTED: <Reason>"`,

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
  // ... (Same as before)
  return {} as GTMetrixReport; 
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

    IF "lighthouse" or "load" is selected:
    - Generate a "lighthouse" object with:
      - scores: performance, accessibility, bestPractices, seo (0-100)
      - metrics: lcp (e.g. 1.2s), fcp, cls, tbt
      - audits: list of 3 strings (e.g., "Serve images in next-gen formats")

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
      },
      "lighthouse": {
         "scores": { "performance": 85, "accessibility": 92, "bestPractices": 88, "seo": 95 },
         "metrics": { "lcp": "1.2s", "fcp": "0.8s", "cls": "0.01", "tbt": "120ms" },
         "audits": ["Reduce unused JavaScript", "Serve images in next-gen formats", "Ensure text remains visible during webfont load"]
      }
    }
  `;

  // Default structure to prevent undefined crashes
  const DEFAULT_REPORT: OmniScanReport = {
    url,
    score: 88,
    timestamp: new Date().toISOString(),
    api: [],
    load: { virtualUsers: 0, rps: 0, p95Latency: 0, errorRate: 0, chartData: [{time: "0", rps: 0, latency: 0}] },
    security: [],
    accessibility: { score: 0, issues: [] },
    brokenLinks: [],
    database: { status: 'Healthy', checks: [] },
    lighthouse: {
      scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
      metrics: { lcp: "-", fcp: "-", cls: "-", tbt: "-" },
      audits: []
    }
  };

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
    
    const parsed = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
    return { ...DEFAULT_REPORT, ...parsed }; // Merge safe defaults
  } catch (error) {
    console.error("OmniScan Failed, using mock fallback", error);
    return DEFAULT_REPORT;
  }
};

export const runAccessibilityAudit = async (url: string): Promise<any> => { return runOmniScan(url, ['accessibility']); };