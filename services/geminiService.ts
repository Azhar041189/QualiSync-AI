
import { GoogleGenAI } from "@google/genai";
import { AgentRole, OmniScanReport, SharedWorkflowContext, AgentResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instructions for each agent persona
const PROMPTS = {
  [AgentRole.ANALYST]: `You are "The Analyst" (Agent A) in the QualiSync Multi-Agent System.
  Your Goal: Parse the user story to identify ambiguity, edge cases, and missing requirements.
  Output Format: A clean Gherkin Feature file (Feature/Scenario/Given/When/Then).
  Tone: Analytical, precise, product-focused.`,
  
  [AgentRole.ARCHITECT]: `You are "The Architect" (Agent B).
  Your Goal: Review the Gherkin scenarios and design the Test Automation Strategy.
  Decisions to make: 
  1. UI vs API coverage (Recommend API for speed where possible).
  2. Design Pattern (Page Object Model is mandatory for UI).
  3. Data Strategy (Mock data vs Real data).
  Output Format: A technical strategy document summarizing these decisions.
  Tone: Strategic, authoritative, senior engineer.`,
  
  [AgentRole.CODER]: `You are "The Coder" (Agent C), a Python Playwright expert.
  Your Goal: Write the executable test code based on the Architect's strategy and Analyst's Scenarios.
  
  CRITICAL INSTRUCTION FOR DEMO: 
  If this is the FIRST attempt (no feedback provided), you MUST intentionally make a mistake to demonstrate the Critic agent's capabilities. 
  Include "time.sleep(5)" in your code instead of a dynamic wait.
  
  If this is a RETRY (feedback is provided), you must FIX the code immediately, removing sleeps and using "expect" or "wait_for".
  
  Output Format: Pure Python code block using Playwright.
  Tone: Technical, obedient to the Critic.`,
  
  [AgentRole.CRITIC]: `You are "The Critic" (Agent D), a ruthless QA Tech Lead.
  Your Goal: Review the code for anti-patterns and strict adherence to testing standards.
  
  GENERAL RULES:
  1. REJECT immediately if "time.sleep" is found.
  2. REJECT if XPath is used instead of CSS/TestID.
  3. REJECT if no assertions are present.
  
  API TESTING RULES:
  1. Enforce explicit status code assertions (e.g., 'assert response.status_code == 200').
  2. Require JSON Schema validation for all complex responses.
  3. Reject "broad except" blocks; require specific error handling (e.g., 'except requests.exceptions.Timeout').
  4. Ensure test functions have descriptive names matching the scenario.
  5. Enforce AAA Pattern (Arrange-Act-Assert) structure in comments or layout.
  6. Require assertion messages (e.g., 'assert x == y, "Expected x to match y"').
  
  Output Format: 
  Start with either "APPROVED" or "REJECTED".
  If REJECTED, explain why in 1 sentence.
  Tone: Strict, quality-obsessed, no-nonsense.`,

  [AgentRole.HEALER]: `You are "The Healer" (Agent E).
  Your Goal: Fix runtime execution failures using simulated Vector Embeddings (Semantic Search) or Logic Analysis.
  
  Mode 1 (UI): Fix broken selectors.
  Mode 2 (API): Fix broken contract tests (4xx/5xx errors, schema mismatches, auth failures).
  
  Task:
  1. Analyze why the failure occurred.
  2. For UI: Simulate a Vector Database search to find the nearest neighbor element in the DOM.
  3. For API: Analyze the error (e.g., 401 Unauthorized -> Add Bearer Token; 429 Too Many Requests -> Add retry logic; Schema Mismatch -> Update Expected Schema).
  4. Output a "Self-Healing Report" including:
     - The Root Cause
     - The Fix Strategy
     - The Patched Code Snippet
  
  Tone: Helpful, restorative, highly technical.`
};

/**
 * Builds a structured context prompt for the agent based on the workflow history.
 */
const buildAgentPrompt = (role: AgentRole, context: SharedWorkflowContext): string => {
  let prompt = "";

  // Base Context (Always present)
  prompt += `--- [USER STORY] ---\n${context.userStory}\n\n`;

  // Incremental Context Construction
  if (role === AgentRole.ARCHITECT) {
    prompt += `--- [ANALYST OUTPUT (Gherkin)] ---\n${context.gherkinScenarios}\n\n`;
    prompt += `Task: Design the test strategy based on the Gherkin above.`;
  } 
  
  else if (role === AgentRole.CODER) {
    prompt += `--- [ANALYST OUTPUT (Gherkin)] ---\n${context.gherkinScenarios}\n\n`;
    prompt += `--- [ARCHITECT STRATEGY] ---\n${context.testStrategy}\n\n`;
    
    if (context.criticFeedback) {
      prompt += `--- [CRITIC FEEDBACK (MUST FIX)] ---\nThe Critic rejected your previous code: "${context.criticFeedback}". \nFix this immediately. Do not use time.sleep.\n\n`;
      prompt += `--- [PREVIOUS CODE] ---\n${context.currentCode}\n\n`;
    }
    prompt += `Task: Write/Fix the Playwright Python code.`;
  }

  else if (role === AgentRole.CRITIC) {
    prompt += `--- [ARCHITECT STRATEGY] ---\n${context.testStrategy}\n\n`;
    prompt += `--- [CODE TO REVIEW] ---\n${context.currentCode}\n\n`;
    prompt += `Task: Review the code against the strategy and best practices.`;
  }

  else if (role === AgentRole.HEALER) {
    prompt += `--- [ORIGINAL CODE] ---\n${context.currentCode}\n\n`;
    prompt += `--- [RUNTIME ERROR] ---\n${context.runtimeError}\n\n`;
    prompt += `Task: Heal the code.`;
  }

  else {
    // Analyst or Generic
    prompt += `Task: Analyze the user story.`;
  }

  return prompt;
};

export const runAgentSimulation = async (
  role: AgentRole, 
  context: SharedWorkflowContext
): Promise<AgentResponse> => {
  
  const model = 'gemini-2.5-flash';
  const systemInstruction = PROMPTS[role] || "You are a helpful QA AI Agent.";
  
  // Construct the structured prompt
  const fullPrompt = buildAgentPrompt(role, context);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: role === AgentRole.CODER ? 0.1 : 0.4, // Lower temp for coding
      }
    });

    const text = response.text || "Agent failed to respond.";
    
    // Extract code block if present
    const codeMatch = text.match(/```(?:python|gherkin|typescript)?\s*([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : undefined;
    
    // Determine Status for Critic
    let status: 'APPROVED' | 'REJECTED' | undefined;
    if (role === AgentRole.CRITIC) {
      if (text.toUpperCase().includes("REJECTED")) status = 'REJECTED';
      else if (text.toUpperCase().includes("APPROVED")) status = 'APPROVED';
      else status = 'APPROVED'; // Default fallback
    }

    const cleanText = text.replace(/```[\s\S]*?```/g, '').trim();

    return { text: cleanText, code, status };

  } catch (error) {
    console.error(`Error in ${role}:`, error);
    return { text: "I encountered a processing error. Please try again.", code: undefined };
  }
};

export const healCode = async (brokenCode: string, errorContext: string, type: 'api' | 'ui'): Promise<string> => {
   const context: SharedWorkflowContext = {
     userStory: "Fix broken test script",
     currentCode: brokenCode,
     runtimeError: errorContext
   };
   const response = await runAgentSimulation(AgentRole.HEALER, context);
   return response.code || brokenCode;
};

export const generateCodeFromVideoEvents = async (events: string[]): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are "The Coder" (Agent C). 
  Task: Convert raw "Computer Vision" events into a robust Python Playwright script.
  Rules:
  1. Use Page Object Model concepts where possible.
  2. Do NOT use time.sleep().
  3. Include comments explaining the action.
  Output: Pure Python code block only.`;

  const prompt = `
    Here is the log of user actions detected by the Computer Vision engine from a video recording:
    ${events.map(e => `- ${e}`).join('\n')}
    
    Generate the corresponding Playwright test script.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });
    
    const text = response.text || "";
    const codeMatch = text.match(/```(?:python)?\s*([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : text;
  } catch (error) {
    console.error("Error generating code from video:", error);
    return "# Error generating code. Please try again.";
  }
};

export const generateAutomationCode = async (
  context: string, 
  steps: string[], 
  framework: 'Playwright' | 'Selenium' | 'Cypress'
): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  let language = 'Python';
  if (framework === 'Cypress') language = 'TypeScript';
  if (framework === 'Playwright') language = 'Python';
  if (framework === 'Selenium') language = 'Python';

  const systemInstruction = `You are "The Coder" (Agent C) and "The Healer" (Agent E) combined.
  Your Goal: Convert Natural Language Steps into a robust, Self-Healing Automation Script.
  
  Target Framework: ${framework} (${language})
  
  CRITICAL "SMART SELECTOR" RULE:
  Do not just use one selector. For every element interaction, define a "Resilient Strategy" in comments, then use the best locator.
  Example Logic to include in comments:
  # Selector Strategy for 'Submit':
  # 1. data-testid="submit-btn" (Best)
  # 2. id="submit" (Backup)
  # 3. text="Log In" (Fallback)
  
  Rules:
  1. NO hardcoded sleeps. Use dynamic waits (WebDriverWait, expect, cy.wait).
  2. Include the user's Context: "${context}" in the file header.
  3. Output ONLY the code block.
  `;

  const prompt = `
    User Test Context: ${context}
    
    Recorded Steps:
    ${steps.map((s, i) => `${i+1}. ${s}`).join('\n')}
    
    Generate the full automation script now.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    const text = response.text || "";
    const codeMatch = text.match(/```(?:python|typescript|javascript)?\s*([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : text;
  } catch (error) {
    console.error("Error generating automation code:", error);
    return "# Error generating code. Please try again.";
  }
};

export const generateSyntheticData = async (
  schema: string, 
  count: number, 
  scenario: 'Happy Path' | 'Edge Cases' | 'Security Payloads'
): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are a "Test Data Engineer Agent".
  Your Goal: Generate realistic or destructive synthetic test data in JSON format.
  
  SCENARIOS:
  - "Happy Path": Clean, valid data.
  - "Edge Cases": Max length strings, negative numbers, emojis, nulls.
  - "Security Payloads": SQL Injection strings, XSS scripts, command injection payloads embedded in fields.
  
  Output: STRICT JSON Array only. No markdown text.`;

  const prompt = `
    Schema Definition: ${schema}
    Row Count: ${count}
    Scenario Type: ${scenario}
    
    Generate the JSON data now.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: scenario === 'Happy Path' ? 0.3 : 0.9,
      }
    });

    const text = response.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? jsonMatch[0] : "[]";
  } catch (error) {
    console.error("Error generating synthetic data:", error);
    return "[]";
  }
};

export const analyzeVisualDiff = async (
  context: string,
  baselineBase64?: string | null,
  currentBase64?: string | null
): Promise<{ hasRegression: boolean; description: string }> => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are a "Visual QA Agent". 
  Your Goal: Compare two images (Baseline vs Current) or analyze the description if images are missing.
  Identify layout shifts, missing elements, overlapping content, or color mismatches.
  Output Format: Concise summary of the visual bug. If no images are provided, simulate a finding based on context.`;

  let promptParts: any[] = [];
  
  if (baselineBase64 && currentBase64) {
      // Remove data URL prefix if present for the API call (though inlineData usually expects it or raw bytes, 
      // the SDK handles base64 string directly in inlineData.data)
      // Standard data URL format: data:image/png;base64,....
      const cleanBaseline = baselineBase64.split(',')[1] || baselineBase64;
      const cleanCurrent = currentBase64.split(',')[1] || currentBase64;

      promptParts.push({ text: "Here is the Baseline Image (Version 1.0):" });
      promptParts.push({ inlineData: { mimeType: "image/png", data: cleanBaseline } });
      promptParts.push({ text: "Here is the Current Image (Version 1.1):" });
      promptParts.push({ inlineData: { mimeType: "image/png", data: cleanCurrent } });
      promptParts.push({ text: "Compare these two images strictly. Are there any visual regressions (misalignments, color changes, text overlaps, missing items)? If yes, describe them clearly. If they look identical, say 'No visual changes detected'." });
  } else {
      promptParts.push({ text: `Context: The user is comparing two screenshots of ${context}. Simulate a visual regression finding where a button overlaps text or is misaligned. Describe the error professionally.` });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: promptParts },
      config: { systemInstruction }
    });
    
    const text = response.text || "";
    const hasRegression = !text.toLowerCase().includes("no visual changes") && !text.toLowerCase().includes("identical");

    return { 
      hasRegression, 
      description: text || "Analysis completed." 
    };
  } catch (error) {
    console.error("Visual Analysis Error:", error);
    return { hasRegression: false, description: "Failed to analyze images. Please try again." };
  }
};

// --- OmniScan Integration ---

export const runOmniScan = async (url: string, selectedTests: string[]): Promise<OmniScanReport> => {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are "OmniScan Prime", the ultimate QA engine.
  Your Goal: Generate a realistic, detailed JSON test report for the provided URL, API Spec, or Context.
  
  If 'api' is selected:
  - Generate COMPLEX contract tests including:
    1. Authentication (Simulate Bearer Token handling).
    2. Rate Limiting (Simulate 429 Retry logic).
    3. Data Validation (Schema checks).
    4. HTTP Method coverage (GET, POST, PUT, DELETE).
  - Simulate results for these complex scenarios.
  
  If 'database' is selected:
  - Simulate checks for Data Integrity (Foreign Keys), Schema Compliance, and CRUD latency.
  - Use the provided DB config context (Host/Type) to make the report realistic.
  
  Output: STRICT VALID JSON ONLY. Do not include markdown code blocks.
  `;

  // Explicitly defining schema in the prompt to ensure correct JSON generation
  const prompt = `
    Target (URL, Spec, or Context): """${url}"""
    Selected Tests: ${selectedTests.join(', ')}
    
    Generate a full OmniScan Report JSON.
    Make the data look realistic for this specific target.
    
    REQUIRED JSON STRUCTURE (Fill with realistic data):
    {
      "url": "Target",
      "score": <number 0-100>,
      "timestamp": "2023-10-27T10:00:00Z",
      "api": [
        { "method": "GET", "endpoint": "/api/v1/resource", "status": 200, "latency": 120, "passed": true },
        { "method": "POST", "endpoint": "/api/v1/login", "status": 401, "latency": 45, "passed": false },
        { "method": "DELETE", "endpoint": "/api/v1/user/123", "status": 204, "latency": 200, "passed": true }
      ],
      "contractTestCode": "# Python pytest code if 'api' selected, else null. Include Auth, Rate Limits, and Schema Validation.",
      "load": {
        "virtualUsers": 500,
        "rps": 1200,
        "p95Latency": 350,
        "errorRate": 0.02,
        "chartData": [
          {"time": "00:00", "rps": 100, "latency": 50},
          {"time": "00:05", "rps": 500, "latency": 200},
          {"time": "00:10", "rps": 1200, "latency": 350}
        ]
      },
      "security": [
        { "severity": "High", "type": "XSS Vulnerability", "description": "Reflected XSS in search bar", "remediation": "Sanitize input parameters" }
      ],
      "accessibility": {
        "score": 85,
        "issues": [
          { "id": "color-contrast", "impact": "serious", "element": "button#submit", "description": "Contrast ratio is below 4.5:1", "helpUrl": "..." }
        ]
      },
      "brokenLinks": [
         { "url": "/about-us", "status": 404, "sourcePage": "/" }
      ],
      "database": {
        "status": "Healthy",
        "checks": [
          { "name": "Schema Validation (User Table)", "status": "Pass", "latency": "12ms" },
          { "name": "Foreign Key Integrity (Orders -> Users)", "status": "Pass", "latency": "45ms" },
          { "name": "CRUD Operation (Create Item)", "status": "Pass", "latency": "28ms" }
        ]
      }
    }

    If 'api' is selected, populate 'contractTestCode' with a Python script using 'pytest' and 'requests'.
    The script MUST include:
    1. A fixture for Authentication.
    2. A test for Rate Limiting (assert 429 handling).
    3. JSON Schema validation.
    
    If 'database' is selected, include checks relevant to the DB type inferred from context.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    // Robust text cleaning to handle cases where AI wraps JSON in markdown
    const text = response.text || "{}";
    const cleanText = text.replace(/```json\s*|\s*```/g, "").trim();
    
    // Attempt to extract JSON if there's surrounding text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanText;

    try {
        return JSON.parse(jsonString) as OmniScanReport;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", text);
        throw new Error("Failed to parse report data");
    }
  } catch (error) {
    console.error("OmniScan Failed:", error);
    throw new Error("Scan Generation Failed. Please try again.");
  }
};

export const runAccessibilityAudit = async (url: string): Promise<any> => {
    return runOmniScan(url, ['accessibility']);
};
