export enum AgentRole {
  ANALYST = 'The Analyst',
  ARCHITECT = 'The Architect',
  CODER = 'The Coder',
  CRITIC = 'The Critic',
  HEALER = 'The Healer',
  SECURITY = 'The Security Auditor',
  PERFORMANCE = 'The Performance Engineer',
  ACCESSIBILITY = 'The A11y Coach',
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
  content?: string; 
  errorContext?: string;
}

export interface AgentProduct {
  id: string;
  name: string;
  role: AgentRole; // Link to the enum
  description: string;
  icon: React.ReactNode; // We'll handle this in the component mapping usually, but keeping simple for now
  category: 'Security' | 'Performance' | 'Accessibility' | 'Data';
  price: string;
  installed: boolean;
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
  securityReport?: string;
  performanceReport?: string;
}

export interface AgentResponse {
  text: string;
  code?: string;
  status?: 'APPROVED' | 'REJECTED';
  metadata?: any;
}

// --- Dashboard & Metrics ---

export interface RiskPoint {
  feature: string;
  impact: number;
  likelihood: number;
  riskScore: number;
  category: 'UI' | 'API' | 'Data';
}

export interface SecurityVulnerability {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  remediationCode: string;
}

export interface PerformanceMetric {
  timestamp: string;
  virtualUsers: number;
  rps: number;
  latency: number;
  errorRate: number;
}

export interface DatabaseCheck {
  table: string;
  checkType: 'Schema' | 'Integrity' | 'Performance';
  status: 'Pass' | 'Fail';
  details: string;
}

export interface WebVitalMetric {
  name: string;
  value: string;
  score: number;
  rating: 'Good' | 'Needs Improvement' | 'Poor';
}

export interface WaterfallRequest {
  url: string;
  method: string;
  status: number;
  type: 'html' | 'css' | 'js' | 'image' | 'font' | 'other';
  size: string;
  startTime: number;
  duration: number;
  segments: {
    dns: number;
    ssl: number;
    connect: number;
    send: number;
    wait: number;
    receive: number;
  };
}

export interface HistoryPoint {
  date: string;
  performanceScore: number;
  lcp: number;
}

export interface StructureAudit {
  audit: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface BrowserTimings {
  redirect: number;
  connect: number;
  backend: number;
  ttfb: number;
  domInteractive: number;
  domLoaded: number;
  onload: number;
}

export interface GTMetrixReport {
  url: string;
  timestamp: string;
  location: string;
  device: string;
  gtmetrixGrade: string;
  performanceScore: number;
  structureScore: number;
  webVitals: {
    lcp: WebVitalMetric;
    tbt: WebVitalMetric;
    cls: WebVitalMetric;
  };
  performanceMetrics: {
    fcp: WebVitalMetric;
    si: WebVitalMetric;
    tti: WebVitalMetric;
  };
  browserTimings: BrowserTimings;
  pageDetails: {
    fullyLoadedTime: string;
    totalPageSize: string;
    requests: number;
  };
  topIssues: {
    priority: 'High' | 'Med' | 'Low';
    audit: string;
    impact: string;
  }[];
  waterfall: WaterfallRequest[];
  history: HistoryPoint[];
  filmstrip: string[];
  structureAudits: StructureAudit[];
}

export interface ApiEndpointResult {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  status: number;
  latency: number;
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

export interface LighthouseData {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    lcp: string;
    fcp: string;
    cls: string;
    tbt: string;
  };
  audits: string[];
}

export interface OmniScanReport {
  url: string;
  score: number;
  timestamp: string;
  api: ApiEndpointResult[];
  contractTestCode?: string;
  load: LoadTestResult;
  security: SecurityIssue[];
  accessibility: { score: number; issues: A11yIssue[] };
  brokenLinks: BrokenLinkResult[];
  database: { status: 'Healthy' | 'Degraded'; checks: { name: string; status: 'Pass' | 'Fail'; latency: string }[] };
  lighthouse?: LighthouseData;
}

export interface DeviceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop' | 'watch';
  vendor: 'Apple' | 'Samsung' | 'Google' | 'Microsoft' | 'Other';
  os: 'ios' | 'android' | 'mac' | 'windows' | 'linux';
  userAgent: string;
  skin: 'default' | 'notch' | 'dynamic-island' | 'punch-hole' | 'pill' | 'macbook' | 'ipad' | 'home-button';
}

export interface ResponsiveSession {
  url: string;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  theme: 'light' | 'dark';
  syncScroll: boolean;
  syncClick: boolean;
  syncInput: boolean;
  activeDevices: string[];
  colorScheme: 'original' | 'dark' | 'grayscale' | 'high-contrast';
}