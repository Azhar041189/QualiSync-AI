
export enum AgentRole {
  ANALYST = 'The Analyst',
  ARCHITECT = 'The Architect',
  CODER = 'The Coder',
  CRITIC = 'The Critic',
  HEALER = 'The Healer',
  SECURITY = 'The Security Auditor',
  PERFORMANCE = 'The Performance Engineer',
  IDLE = 'System Idle'
}

export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  SUCCESS = 'success',
  ERROR = 'error',
  REJECTED = 'rejected'
}

export interface AgentLog {
  id: string;
  role: AgentRole;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'code';
  content?: string; // For code blocks or structured output
}

export interface WorkflowStep {
  role: AgentRole;
  status: AgentStatus;
  description: string;
}

// --- Structured Communication Protocol ---

export interface SharedWorkflowContext {
  userStory: string;
  gherkinScenarios?: string;
  testStrategy?: string;
  currentCode?: string;
  criticFeedback?: string;
  runtimeError?: string;
  healedCode?: string;
}

export interface AgentResponse {
  text: string;
  code?: string;
  status?: 'APPROVED' | 'REJECTED';
  metadata?: any;
}

// --- Dashboard & Metrics ---

export interface DashboardMetric {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendLabel: string;
}

export interface RiskPoint {
  feature: string;
  impact: number; // 0-100
  likelihood: number; // 0-100
  riskScore: number; // 0-100
  category: 'UI' | 'API' | 'Data';
}

export interface GeneratedDataRow {
  [key: string]: string | number | boolean;
}

export interface VisualDiffResult {
  hasRegression: boolean;
  confidence: number; // 0-1
  differences: {
    region: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

// --- OmniScan Types ---

export interface ApiEndpointResult {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  latency: number; // ms
  passed: boolean;
}

export interface LoadTestResult {
  virtualUsers: number;
  rps: number;
  p95Latency: number;
  errorRate: number;
  chartData: { time: string; rps: number; latency: number }[];
}

export interface SecurityIssue {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  type: string;
  description: string;
  remediation: string;
}

export interface A11yIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
  helpUrl: string;
}

export interface BrokenLinkResult {
  url: string;
  status: number;
  sourcePage: string;
}

export interface OmniScanReport {
  url: string;
  score: number;
  timestamp: string;
  api: ApiEndpointResult[];
  contractTestCode?: string; // Generated Python/Pytest code
  load: LoadTestResult;
  security: SecurityIssue[];
  accessibility: { score: number; issues: A11yIssue[] };
  brokenLinks: BrokenLinkResult[];
  database: { status: 'Healthy' | 'Degraded'; checks: { name: string; status: 'Pass' | 'Fail'; latency: string }[] };
}
