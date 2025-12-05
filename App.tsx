
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
import SecurityLab from './components/SecurityLab';
import PerformanceLab from './components/PerformanceLab';
import DatabaseLab from './components/DatabaseLab';
import ResponsiveStudio from './components/ResponsiveStudio';
import { runAgentSimulation } from './services/geminiService';
import { 
  Play, Activity, Layers, Cpu, Zap, LayoutDashboard, FileCode, AlertTriangle, 
  Map, ShoppingBag, Database, Shield, Server, Globe, Smartphone
} from 'lucide-react';

const MOCK_RISK_DATA: RiskPoint[] = [
  { feature: "Checkout Flow", impact: 95, likelihood: 20, riskScore: 85, category: 'UI' },
  { feature: "User Login", impact: 90, likelihood: 10, riskScore: 50, category: 'UI' },
  { feature: "Payment Gateway", impact: 98, likelihood: 5, riskScore: 60, category: 'API' },
  { feature: "Search Index", impact: 40, likelihood: 60, riskScore: 48, category: 'Data' },
  { feature: "Profile Edit", impact: 30, likelihood: 15, riskScore: 10, category: 'UI' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'bridge' | 'omni' | 'apilab' | 'security' | 'perf' | 'db' | 'roadmap' | 'settings' | 'memory' | 'marketplace' | 'data' | 'vision' | 'studio'>('dashboard');
  const [inputStory, setInputStory] = useState<string>("As a user, I want to reset my password using a recovery email...");
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
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const addLog = (role: AgentRole, message: string, type: AgentLog['type'] = 'info', content?: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), role, message, timestamp: Date.now(), type, content }]);
  };

  const updateStatus = (role: AgentRole, status: AgentStatus) => {
    setAgentStatuses(prev => ({ ...prev, [role]: status }));
  };

  const startSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]); 
    Object.values(AgentRole).forEach(r => updateStatus(r, AgentStatus.IDLE));

    const workflowContext: SharedWorkflowContext = { userStory: inputStory, gherkinScenarios: "", testStrategy: "", currentCode: "", criticFeedback: "" };

    try {
      // 1. ANALYST
      setActiveRole(AgentRole.ANALYST); updateStatus(AgentRole.ANALYST, AgentStatus.THINKING);
      addLog(AgentRole.ANALYST, "Identifying requirements...", 'info');
      const analysis = await runAgentSimulation(AgentRole.ANALYST, workflowContext);
      workflowContext.gherkinScenarios = analysis.text;
      addLog(AgentRole.ANALYST, "Scenarios Generated", 'success', analysis.text);
      updateStatus(AgentRole.ANALYST, AgentStatus.SUCCESS);

      // 2. ARCHITECT
      setActiveRole(AgentRole.ARCHITECT); updateStatus(AgentRole.ARCHITECT, AgentStatus.THINKING);
      const strategy = await runAgentSimulation(AgentRole.ARCHITECT, workflowContext);
      workflowContext.testStrategy = strategy.text;
      addLog(AgentRole.ARCHITECT, "Strategy Defined", 'success', strategy.text);
      updateStatus(AgentRole.ARCHITECT, AgentStatus.SUCCESS);

      // 3. CODER <-> CRITIC LOOP
      let codeApproved = false;
      let attemptCount = 0;
      while (!codeApproved && attemptCount < 3) {
        attemptCount++;
        setActiveRole(AgentRole.CODER); updateStatus(AgentRole.CODER, AgentStatus.THINKING);
        const codeResult = await runAgentSimulation(AgentRole.CODER, workflowContext);
        workflowContext.currentCode = codeResult.code || codeResult.text;
        workflowContext.criticFeedback = ""; 
        addLog(AgentRole.CODER, `Draft #${attemptCount}`, 'code', workflowContext.currentCode);
        updateStatus(AgentRole.CODER, AgentStatus.SUCCESS);

        setActiveRole(AgentRole.CRITIC); updateStatus(AgentRole.CRITIC, AgentStatus.THINKING);
        const critique = await runAgentSimulation(AgentRole.CRITIC, workflowContext);
        
        if (critique.status === 'REJECTED') {
          addLog(AgentRole.CRITIC, `REJECTED: ${critique.text}`, 'error');
          updateStatus(AgentRole.CRITIC, AgentStatus.REJECTED);
          workflowContext.criticFeedback = critique.text;
        } else {
          addLog(AgentRole.CRITIC, `APPROVED`, 'success', critique.text);
          updateStatus(AgentRole.CRITIC, AgentStatus.SUCCESS);
          codeApproved = true;
        }
      }

      if (!codeApproved) throw new Error("Critic rejected code 3 times.");

      // 4. RUNTIME / HEALER
      setActiveRole(AgentRole.IDLE); addLog(AgentRole.IDLE, "Deploying...", 'info');
      await new Promise(r => setTimeout(r, 1000));
      
      const mockError = "NoSuchElementException: '#submit-btn' not found.";
      workflowContext.runtimeError = mockError;
      addLog(AgentRole.IDLE, `RUNTIME FAILURE: ${mockError}`, 'error');

      setActiveRole(AgentRole.HEALER); updateStatus(AgentRole.HEALER, AgentStatus.THINKING);
      const healerResult = await runAgentSimulation(AgentRole.HEALER, workflowContext);
      addLog(AgentRole.HEALER, "Patched Code", 'success', healerResult.code);
      updateStatus(AgentRole.HEALER, AgentStatus.SUCCESS);

      setActiveRole(AgentRole.IDLE); addLog(AgentRole.IDLE, "Workflow Complete.", 'success');

    } catch (e: any) {
      addLog(AgentRole.IDLE, `Error: ${e.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const renderSidebar = () => (
    <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-20 overflow-y-auto scrollbar-hide shadow-sm">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 flex-shrink-0">
        <Cpu className="text-white" size={24} />
      </div>
      <div className="flex flex-col gap-6 w-full items-center">
        <SidebarIcon icon={<Activity />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} tooltip="Dashboard" />
        <SidebarIcon icon={<Smartphone />} active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} tooltip="Responsive Studio (Sizzy)" />
        <SidebarIcon icon={<Globe />} active={activeTab === 'omni'} onClick={() => setActiveTab('omni')} tooltip="OmniScan Tester" />
        <SidebarIcon icon={<Server />} active={activeTab === 'apilab'} onClick={() => setActiveTab('apilab')} tooltip="API Lab" />
        <SidebarIcon icon={<Shield />} active={activeTab === 'security'} onClick={() => setActiveTab('security')} tooltip="Security Lab" />
        <SidebarIcon icon={<Zap />} active={activeTab === 'perf'} onClick={() => setActiveTab('perf')} tooltip="Performance Lab" />
        <SidebarIcon icon={<Database />} active={activeTab === 'db'} onClick={() => setActiveTab('db')} tooltip="Database Lab" />
        <SidebarIcon icon={<Layers />} active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} tooltip="Agent Lab" />
        <SidebarIcon icon={<FileCode />} active={activeTab === 'bridge'} onClick={() => setActiveTab('bridge')} tooltip="Codeless Bridge" />
        <SidebarIcon icon={<ShoppingBag />} active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} tooltip="Agent Store" />
        <SidebarIcon icon={<Map />} active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} tooltip="Strategy Roadmap" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {renderSidebar()}
      <main className="flex-grow overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-600 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            QualiSync v3.1 (Enterprise)
          </div>
        </div>
        
        {activeTab === 'dashboard' && <div className="p-8 h-full overflow-y-auto">
           <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="text-blue-600"/> Overview</h1>
           <div className="grid grid-cols-3 gap-8 h-[500px]">
              <div className="col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><HeatmapChart data={MOCK_RISK_DATA}/></div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4">Active Incidents</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-3 rounded border border-red-100 flex gap-2"><AlertTriangle className="text-red-500" size={16}/> <span className="text-xs font-bold text-red-600">SQL Injection Detect</span></div>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-100 flex gap-2"><Activity className="text-yellow-500" size={16}/> <span className="text-xs font-bold text-yellow-600">Latency > 500ms</span></div>
                </div>
              </div>
           </div>
        </div>}
        
        {activeTab === 'studio' && <ResponsiveStudio />}
        {activeTab === 'omni' && <OmniTester />}
        {activeTab === 'apilab' && <ApiLab />}
        {activeTab === 'security' && <SecurityLab />}
        {activeTab === 'perf' && <PerformanceLab />}
        {activeTab === 'db' && <DatabaseLab />}
        {activeTab === 'agents' && (
          <div className="flex h-full">
            <div className="w-1/3 border-r border-slate-200 bg-white p-6 flex flex-col z-10 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 flex gap-2"><Layers className="text-blue-600" /> Workflow</h2>
              <textarea className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none" value={inputStory} onChange={(e) => setInputStory(e.target.value)} />
              <button onClick={startSimulation} disabled={isRunning} className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg flex justify-center gap-2 hover:bg-blue-500 disabled:opacity-50">{isRunning ? <Activity className="animate-spin"/> : <Play/>} Start System</button>
            </div>
            <div className="w-2/3 flex flex-col bg-slate-50">
              <div className="h-1/2 p-6 border-b border-slate-200 bg-white"><AgentVisualizer activeRole={activeRole} statuses={agentStatuses} /></div>
              <div className="h-1/2 p-4 bg-white overflow-y-auto font-mono text-sm space-y-4 border-t border-slate-100">
                {logs.map(log => (
                  <div key={log.id} className="animate-fadeIn">
                    <div className="flex gap-2 mb-1"><span className="text-xs text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span><span className={`text-[10px] font-bold px-2 rounded border ${log.role === AgentRole.CRITIC ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{log.role}</span></div>
                    <div className={`pl-3 border-l-2 ml-1 ${log.type === 'error' ? 'border-red-400' : 'border-slate-300'}`}>{log.message}</div>
                    {log.content && <pre className="mt-2 bg-slate-50 p-3 rounded text-xs overflow-x-auto border border-slate-200 text-slate-700">{log.content}</pre>}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'bridge' && <CodelessBridge />}
        {activeTab === 'memory' && <VectorMemory />}
        {activeTab === 'marketplace' && <Marketplace />}
        {activeTab === 'data' && <SyntheticData />}
        {activeTab === 'vision' && <VisualEye />}
        {activeTab === 'roadmap' && <Roadmap />}
        {activeTab === 'settings' && <IntegrationsSettings />}
      </main>
    </div>
  );
};

const SidebarIcon = ({ icon, active, onClick, tooltip }: any) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all group relative ${active ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
    {icon} <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-white text-slate-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 shadow-md border border-slate-200 pointer-events-none z-50 whitespace-nowrap">{tooltip}</div>
  </button>
);

export default App;
