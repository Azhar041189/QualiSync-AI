import React, { useState, useEffect, useRef } from 'react';
import { AgentRole, AgentStatus, AgentLog, RiskPoint, SharedWorkflowContext } from './types';
import HeatmapChart from './components/HeatmapChart';
import AgentVisualizer from './components/AgentVisualizer';
import Roadmap from './components/Roadmap';
import CodelessBridge from './components/CodelessBridge';
import IntegrationsSettings from './components/IntegrationsSettings';
import VectorMemory from './components/VectorMemory';
import Marketplace from './components/Marketplace';
import SyntheticData from './components/SyntheticData';
import VisualEye from './components/VisualEye';
import OmniTester from './components/OmniTester';
import ApiLab from './components/ApiLab';
import { runAgentSimulation } from './services/geminiService';
import { 
  Play, 
  Terminal, 
  Activity, 
  Layers, 
  Cpu, 
  Zap,
  LayoutDashboard,
  FileCode,
  AlertTriangle,
  RefreshCw,
  Map,
  ShoppingBag,
  Database,
  Eye,
  Server,
  Globe
} from 'lucide-react';

// --- Mock Data ---
const MOCK_RISK_DATA: RiskPoint[] = [
  { feature: "Checkout Flow", impact: 95, likelihood: 20, riskScore: 85, category: 'UI' },
  { feature: "User Login", impact: 90, likelihood: 10, riskScore: 50, category: 'UI' },
  { feature: "Payment Gateway", impact: 98, likelihood: 5, riskScore: 60, category: 'API' },
  { feature: "Search Index", impact: 40, likelihood: 60, riskScore: 48, category: 'Data' },
  { feature: "Profile Edit", impact: 30, likelihood: 15, riskScore: 10, category: 'UI' },
  { feature: "Admin Dashboard", impact: 70, likelihood: 30, riskScore: 65, category: 'UI' },
  { feature: "API Rate Limit", impact: 80, likelihood: 40, riskScore: 78, category: 'API' },
];

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'bridge' | 'omni' | 'apilab' | 'roadmap' | 'settings' | 'memory' | 'marketplace' | 'data' | 'vision'>('dashboard');
  const [inputStory, setInputStory] = useState<string>("As a user, I want to reset my password using a recovery email so that I can regain access to my account if I forget my credentials.");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [activeRole, setActiveRole] = useState<AgentRole>(AgentRole.IDLE);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentRole, AgentStatus>>({
    [AgentRole.ANALYST]: AgentStatus.IDLE,
    [AgentRole.ARCHITECT]: AgentStatus.IDLE,
    [AgentRole.CODER]: AgentStatus.IDLE,
    [AgentRole.CRITIC]: AgentStatus.IDLE,
    [AgentRole.HEALER]: AgentStatus.IDLE,
    [AgentRole.SECURITY]: AgentStatus.IDLE,
    [AgentRole.PERFORMANCE]: AgentStatus.IDLE,
    [AgentRole.IDLE]: AgentStatus.IDLE,
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Logic ---

  const addLog = (role: AgentRole, message: string, type: AgentLog['type'] = 'info', content?: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role,
      message,
      timestamp: Date.now(),
      type,
      content
    }]);
  };

  const updateStatus = (role: AgentRole, status: AgentStatus) => {
    setAgentStatuses(prev => ({ ...prev, [role]: status }));
  };

  const startSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]); // Clear logs
    Object.values(AgentRole).forEach(r => updateStatus(r, AgentStatus.IDLE));

    // Initialize Shared Workflow Context
    const workflowContext: SharedWorkflowContext = {
      userStory: inputStory,
      gherkinScenarios: "",
      testStrategy: "",
      currentCode: "",
      criticFeedback: "",
    };

    try {
      // 1. ANALYST
      setActiveRole(AgentRole.ANALYST);
      updateStatus(AgentRole.ANALYST, AgentStatus.THINKING);
      addLog(AgentRole.ANALYST, "Reading User Story and identifying ambiguity...", 'info');
      
      const analysis = await runAgentSimulation(AgentRole.ANALYST, workflowContext);
      
      // Update Context with Analyst Output
      workflowContext.gherkinScenarios = analysis.text;

      addLog(AgentRole.ANALYST, "Gherkin Scenarios Generated", 'success', analysis.code || analysis.text);
      updateStatus(AgentRole.ANALYST, AgentStatus.SUCCESS);

      // 2. ARCHITECT
      setActiveRole(AgentRole.ARCHITECT);
      updateStatus(AgentRole.ARCHITECT, AgentStatus.THINKING);
      addLog(AgentRole.ARCHITECT, "Designing Test Strategy (POM & API Mocking)...", 'info');
      
      const strategy = await runAgentSimulation(AgentRole.ARCHITECT, workflowContext);
      
      // Update Context with Architect Output
      workflowContext.testStrategy = strategy.text;

      addLog(AgentRole.ARCHITECT, "Strategy Defined", 'success', strategy.text);
      updateStatus(AgentRole.ARCHITECT, AgentStatus.SUCCESS);

      // --- THE CODER <-> CRITIC LOOP ---
      let codeApproved = false;
      let attemptCount = 0;
      
      while (!codeApproved && attemptCount < 3) {
        attemptCount++;
        
        // 3. CODER (Write/Fix)
        setActiveRole(AgentRole.CODER);
        updateStatus(AgentRole.CODER, AgentStatus.THINKING);
        if (attemptCount === 1) {
          addLog(AgentRole.CODER, "Drafting initial Playwright script...", 'info');
        } else {
          updateStatus(AgentRole.CRITIC, AgentStatus.ERROR); // Keep critic red briefly
          addLog(AgentRole.CODER, `Applying Fixes based on Critic feedback...`, 'warning');
        }

        const codeResult = await runAgentSimulation(AgentRole.CODER, workflowContext);
        
        // Update Context with Coder Output
        const newCode = codeResult.code || codeResult.text;
        workflowContext.currentCode = newCode;
        // Reset feedback for next loop (Critic will re-populate if needed)
        workflowContext.criticFeedback = ""; 

        addLog(AgentRole.CODER, `Code Draft #${attemptCount} Generated`, 'code', newCode);
        updateStatus(AgentRole.CODER, AgentStatus.SUCCESS);

        // 4. CRITIC (Review)
        setActiveRole(AgentRole.CRITIC);
        updateStatus(AgentRole.CRITIC, AgentStatus.THINKING);
        addLog(AgentRole.CRITIC, "Reviewing code for 'sleeps' and anti-patterns...", 'info');

        const critique = await runAgentSimulation(AgentRole.CRITIC, workflowContext);

        if (critique.status === 'REJECTED') {
          addLog(AgentRole.CRITIC, `REJECTED: ${critique.text}`, 'error');
          updateStatus(AgentRole.CRITIC, AgentStatus.REJECTED);
          
          // Update Context with Critic Feedback
          workflowContext.criticFeedback = critique.text;
          codeApproved = false;
          
          // Wait briefly for effect
          await new Promise(r => setTimeout(r, 1000));
        } else {
          addLog(AgentRole.CRITIC, `APPROVED: Quality Gate Passed.`, 'success', critique.text);
          updateStatus(AgentRole.CRITIC, AgentStatus.SUCCESS);
          codeApproved = true;
        }
      }

      if (!codeApproved) {
        throw new Error("Maximum retry limit reached. Critic refused to approve code.");
      }

      // 5. RUNTIME EXECUTION & HEALER
      setActiveRole(AgentRole.IDLE);
      addLog(AgentRole.IDLE, "Deploying script to CI/CD Environment...", 'info');
      await new Promise(r => setTimeout(r, 1500)); // Simulate delay

      // Mock Failure
      const mockError = "NoSuchElementException: Unable to locate element with css selector: '#submit-btn'. \nCause: Element ID changed in DOM to '#submit-v2-action'.";
      workflowContext.runtimeError = mockError;

      addLog(AgentRole.IDLE, `RUNTIME FAILURE DETECTED: ${mockError}`, 'error');
      
      // Activate Healer
      setActiveRole(AgentRole.HEALER);
      updateStatus(AgentRole.HEALER, AgentStatus.THINKING);
      addLog(AgentRole.HEALER, "Triggering Self-Healing protocol...", 'info');
      
      const healerResult = await runAgentSimulation(AgentRole.HEALER, workflowContext);
      
      // Update Context with Healed Code
      workflowContext.healedCode = healerResult.code || healerResult.text;

      addLog(AgentRole.HEALER, "Vector Search Complete: Patch Applied", 'success', healerResult.text);
      updateStatus(AgentRole.HEALER, AgentStatus.SUCCESS);

      // Final State
      setActiveRole(AgentRole.IDLE);
      addLog(AgentRole.IDLE, "Workflow Completed. Script Healed & Saved to Repo.", 'success');

    } catch (e: any) {
      console.error(e);
      addLog(AgentRole.IDLE, `Workflow Halted: ${e.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // --- Components ---

  const renderSidebar = () => (
    <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-20 overflow-y-auto scrollbar-hide shadow-sm">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 flex-shrink-0">
        <Cpu className="text-white" size={24} />
      </div>
      
      <div className="flex flex-col gap-6 w-full items-center">
        <SidebarIcon icon={<Activity />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} tooltip="Dashboard" />
        <SidebarIcon icon={<Globe />} active={activeTab === 'omni'} onClick={() => setActiveTab('omni')} tooltip="OmniScan Tester" />
        <SidebarIcon icon={<Server />} active={activeTab === 'apilab'} onClick={() => setActiveTab('apilab')} tooltip="API Lab" />
        <SidebarIcon icon={<Layers />} active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} tooltip="Agent Lab" />
        <SidebarIcon icon={<FileCode />} active={activeTab === 'bridge'} onClick={() => setActiveTab('bridge')} tooltip="Codeless Bridge" />
        <SidebarIcon icon={<Database />} active={activeTab === 'memory'} onClick={() => setActiveTab('memory')} tooltip="Neural Grid" />
        <SidebarIcon icon={<Database />} active={activeTab === 'data'} onClick={() => setActiveTab('data')} tooltip="Data Engine" />
        <SidebarIcon icon={<Eye />} active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} tooltip="Visual Eye" />
        <SidebarIcon icon={<ShoppingBag />} active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} tooltip="Agent Store" />
        <SidebarIcon icon={<Map />} active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} tooltip="Strategy Roadmap" />
      </div>
      
      <div className="mt-auto pt-4">
         <SidebarIcon icon={<Zap />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} tooltip="Integrations Hub" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 flex items-center gap-2">
        <LayoutDashboard className="text-blue-600" /> Executive Overview
      </h1>
      
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard label="Test Coverage" value="92.4%" trend={+5.2} />
        <MetricCard label="Self-Healed Scripts" value="143" trend={+12.0} />
        <MetricCard label="Pipeline Time" value="12m 30s" trend={-8.5} />
        <MetricCard label="Digital Workers" value="5 Active" trend={0} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Quality Risk Heatmap</h2>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">Real-time Analysis</span>
           </div>
           <div className="h-[400px]">
             <HeatmapChart data={MOCK_RISK_DATA} />
           </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            <AlertItem title="API Contract Breach" desc="Checkout Service v2.1" severity="high" />
            <AlertItem title="Visual Regression" desc="Button Misalignment (32px)" severity="medium" />
            <AlertItem title="Selector Changed" desc="Submit Button (Healed)" severity="low" />
            <AlertItem title="Test Data Low" desc="User Pool < 10 records" severity="low" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgentLab = () => (
    <div className="flex h-full">
      {/* Input / Control Panel */}
      <div className="w-1/3 border-r border-slate-200 bg-white p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center gap-2">
          <Layers className="text-blue-600" /> Workflow Input
        </h2>
        <div className="mb-6 flex-grow">
          <label className="block text-sm font-medium text-slate-500 mb-2">Jira Story / Requirement</label>
          <textarea 
            className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none font-mono text-sm shadow-inner"
            value={inputStory}
            onChange={(e) => setInputStory(e.target.value)}
          />
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Active Agents</h3>
          <div className="space-y-2">
            <AgentStatusRow role="The Analyst" status={agentStatuses[AgentRole.ANALYST]} />
            <AgentStatusRow role="The Architect" status={agentStatuses[AgentRole.ARCHITECT]} />
            <AgentStatusRow role="The Coder" status={agentStatuses[AgentRole.CODER]} />
            <AgentStatusRow role="The Critic" status={agentStatuses[AgentRole.CRITIC]} />
            <AgentStatusRow role="The Healer" status={agentStatuses[AgentRole.HEALER]} />
          </div>
        </div>

        <button 
          onClick={startSimulation}
          disabled={isRunning}
          className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            isRunning ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {isRunning ? <><Activity className="animate-spin" /> Orchestrating...</> : <><Play fill="currentColor" /> Start Multi-Agent System</>}
        </button>
      </div>

      {/* Visualizer & Logs */}
      <div className="w-2/3 flex flex-col bg-slate-50 relative">
        <div className="h-1/2 p-6 border-b border-slate-200 relative bg-white">
          <div className="absolute top-4 right-4 z-10">
             <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-500 shadow-sm">
                <RefreshCw size={12} className={activeRole === AgentRole.CODER || activeRole === AgentRole.CRITIC ? "animate-spin" : ""} />
                <span>Loop: AutoGen Sync</span>
             </div>
          </div>
          <AgentVisualizer activeRole={activeRole} statuses={agentStatuses} />
        </div>
        
        {/* Terminal / Logs Area - Light Theme */}
        <div className="h-1/2 p-4 bg-white overflow-hidden flex flex-col border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2 px-2 border-b border-slate-100 pb-2">
            <Terminal size={16} />
            <span className="text-xs font-mono uppercase font-bold">System Logs & Thought Process</span>
          </div>
          <div className="flex-grow overflow-y-auto scrollbar-hide font-mono text-sm p-2 space-y-4">
            {logs.length === 0 && <div className="text-slate-400 italic text-center mt-10">Waiting for agent execution stream...</div>}
            {logs.map((log) => (
              <div key={log.id} className="animate-fadeIn">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    log.role === AgentRole.CRITIC ? 'bg-red-50 border-red-200 text-red-600' : 
                    log.role === AgentRole.CODER ? 'bg-green-50 border-green-200 text-green-600' : 
                    log.role === AgentRole.HEALER ? 'bg-purple-50 border-purple-200 text-purple-600' :
                    'bg-blue-50 border-blue-200 text-blue-600'
                  }`}>{log.role}</span>
                </div>
                <div className={`pl-3 border-l-2 ml-1 ${
                  log.type === 'error' ? 'border-red-400 text-red-600' : 
                  log.type === 'success' ? 'border-green-400 text-green-700' : 
                  'border-slate-300 text-slate-600'
                }`}>
                  {log.message}
                </div>
                {log.content && (
                  <div className={`mt-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs overflow-x-auto whitespace-pre-wrap shadow-sm ${
                     log.role === AgentRole.CRITIC && log.type === 'error' ? 'text-red-700 bg-red-50 border-red-100' : 'text-slate-800'
                  }`}>
                    {log.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {renderSidebar()}
      <main className="flex-grow overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 z-10">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-600 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            QualiSync v2.1 (Intelligence Suite)
          </div>
        </div>
        
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'omni' && <OmniTester />}
        {activeTab === 'apilab' && <ApiLab />}
        {activeTab === 'agents' && renderAgentLab()}
        {activeTab === 'roadmap' && <Roadmap />}
        {activeTab === 'bridge' && <CodelessBridge />}
        {activeTab === 'settings' && <IntegrationsSettings />}
        {activeTab === 'memory' && <VectorMemory />}
        {activeTab === 'marketplace' && <Marketplace />}
        {activeTab === 'data' && <SyntheticData />}
        {activeTab === 'vision' && <VisualEye />}
      </main>
    </div>
  );
};

// --- Sub-components ---

const SidebarIcon = ({ icon, active, onClick, tooltip }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all duration-200 group relative flex-shrink-0 ${
      active ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    {icon}
    <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-white text-slate-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-200 shadow-md z-50">
      {tooltip}
    </div>
  </button>
);

const MetricCard = ({ label, value, trend }: any) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <p className="text-slate-500 text-sm font-medium mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
  </div>
);

const AlertItem = ({ title, desc, severity }: any) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200 hover:border-slate-300 transition-colors">
    <div className={`mt-1 p-1 rounded-full ${
      severity === 'high' ? 'bg-red-100 text-red-500' : 
      severity === 'medium' ? 'bg-yellow-100 text-yellow-500' : 'bg-blue-100 text-blue-500'
    }`}>
      <AlertTriangle size={12} />
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

const AgentStatusRow = ({ role, status }: { role: string, status: AgentStatus }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-500">{role}</span>
    <span className={`px-2 py-0.5 rounded capitalize ${
      status === AgentStatus.THINKING ? 'bg-blue-100 text-blue-600 animate-pulse' :
      status === AgentStatus.SUCCESS ? 'bg-green-100 text-green-600' :
      status === AgentStatus.REJECTED ? 'bg-red-100 text-red-600 font-bold' :
      status === AgentStatus.ERROR ? 'bg-red-100 text-red-600' :
      'bg-slate-100 text-slate-400'
    }`}>
      {status}
    </span>
  </div>
);

export default App;