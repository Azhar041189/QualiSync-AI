
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
  errorContext?: string; // For debugging details
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

export interface RiskPoint {
  feature: string;
  impact: number; // 0-100
  likelihood: number; // 0-100
  riskScore: number; // 0-100
  category: 'UI' | 'API' | 'Data';
}

// --- Specialized Lab Types ---

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

// --- GTMetrix / Web Vitals Types ---

export interface WebVitalMetric {
  name: string; // e.g., "LCP", "TBT"
  value: string; // e.g., "1.2s"
  score: number; // 0-100
  rating: 'Good' | 'Needs Improvement' | 'Poor';
}

export interface WaterfallRequest {
  url: string;
  method: string;
  status: number;
  type: 'html' | 'css' | 'js' | 'image' | 'font' | 'other';
  size: string;
  startTime: number; // ms from start
  duration: number; // ms
  segments: {
    dns: number;
    ssl: number;
    connect: number;
    send: number;
    wait: number; // TTFB
    receive: number;
  };
}

export interface HistoryPoint {
  date: string;
  performanceScore: number;
  lcp: number; // seconds
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
  gtmetrixGrade: string; // "A", "B", "C"...
  performanceScore: number; // %
  structureScore: number; // %
  webVitals: {
    lcp: WebVitalMetric; // Largest Contentful Paint
    tbt: WebVitalMetric; // Total Blocking Time
    cls: WebVitalMetric; // Cumulative Layout Shift
  };
  performanceMetrics: {
    fcp: WebVitalMetric; // First Contentful Paint
    si: WebVitalMetric; // Speed Index
    tti: WebVitalMetric; // Time to Interactive
  };
  browserTimings: BrowserTimings;
  pageDetails: {
    fullyLoadedTime: string;
    totalPageSize: string;
    requests: number;
  };
  topIssues: {
    priority: 'High' | 'Med' | 'Low';
    audit: string; // e.g., "Serve static assets with an efficient cache policy"
    impact: string; // e.g., "Potential savings of 120ms"
  }[];
  waterfall: WaterfallRequest[];
  history: HistoryPoint[];
  filmstrip: string[]; // Timestamps/Images
  structureAudits: StructureAudit[];
}

// --- OmniScan Types ---

export interface ApiEndpointResult {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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

// --- Responsive Studio (Sizzy) Types ---

export interface DeviceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop' | 'watch';
  vendor: 'Apple' | 'Samsung' | 'Google' | 'Microsoft' | 'Other';
  os: 'ios' | 'android' | 'mac' | 'windows' | 'linux';
  userAgent: string;
  skin: 'default' | 'notch' | 'dynamic-island' | 'punch-hole' | 'pill' | 'macbook' | 'ipad';
}

export interface ResponsiveSession {
  url: string;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  theme: 'light' | 'dark';
  syncScroll: boolean;
  syncClick: boolean;
  syncInput: boolean;
  activeDevices: string[]; // Device IDs
}
