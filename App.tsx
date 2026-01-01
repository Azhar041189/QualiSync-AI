
import React, { useState, useEffect, useRef } from 'react';
import { AgentRole, AgentStatus, AgentLog, RiskPoint, SharedWorkflowContext, AgentProduct } from './types';
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
  Map, ShoppingBag, Database, Shield, Server, Globe, Smartphone, Sun, Moon,
  Terminal, Sparkles, Wifi
} from 'lucide-react';

const MOCK_RISK_DATA: RiskPoint[] = [
  { feature: "Checkout Flow", impact: 95, likelihood: 20, riskScore: 85, category: 'UI' },
  { feature: "User Login", impact: 90, likelihood: 10, riskScore: 50, category: 'UI' },
  { feature: "Payment Gateway", impact: 98, likelihood: 5, riskScore: 60, category: 'API' },
  { feature: "Search Index", impact: 40, likelihood: 60, riskScore: 48, category: 'Data' },
  { feature: "Profile Edit", impact: 30, likelihood: 15, riskScore: 10, category: 'UI' }
];

const DEFAULT_AGENTS: AgentProduct[] = [
  { id: 'sec_01', name: 'Zero-Trust Security Auditor', description: 'Auto-injects SQLi and XSS payloads into input fields.', icon: '', category: 'Security', price: '$499/mo', installed: false, role: AgentRole.SECURITY },
  { id: 'perf_01', name: 'Lighthouse Performance Guard', description: 'Runs Lighthouse CI checks on every build.', icon: '', category: 'Performance', price: '$299/mo', installed: false, role: AgentRole.PERFORMANCE },
  { id: 'a11y_01', name: 'A11y Accessibility Coach', description: 'Scans DOM for WCAG 2.1 violations.', icon: '', category: 'Accessibility', price: 'Free', installed: true, role: AgentRole.ACCESSIBILITY },
  { id: 'data_01', name: 'Synthetic Data Fabricator', description: 'Generates GDPR-compliant PII mock data.', icon: '', category: 'Data', price: '$199/mo', installed: false, role: AgentRole.IDLE }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'bridge' | 'omni' | 'apilab' | 'security' | 'perf' | 'db' | 'roadmap' | 'settings' | 'memory' | 'marketplace' | 'data' | 'vision' | 'studio'>('dashboard');
  const [inputStory, setInputStory] = useState<string>("As a user, I want to reset my password using a recovery email...");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [activeRole, setActiveRole] = useState<AgentRole>(AgentRole.IDLE);
  const [marketplaceAgents, setMarketplaceAgents] = useState<AgentProduct[]>(DEFAULT_AGENTS);
  const [isBooting, setIsBooting] = useState(true);
  
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentRole, AgentStatus>>({
    [AgentRole.ANALYST]: AgentStatus.IDLE,
    [AgentRole.ARCHITECT]: AgentStatus.IDLE,
    [AgentRole.CODER]: AgentStatus.IDLE,
    [AgentRole.CRITIC]: AgentStatus.IDLE,
    [AgentRole.HEALER]: AgentStatus.IDLE,
    [AgentRole.SECURITY]: AgentStatus.IDLE,
    [AgentRole.PERFORMANCE]: AgentStatus.IDLE,
    [AgentRole.ACCESSIBILITY]: AgentStatus.IDLE,
    [AgentRole.IDLE]: AgentStatus.IDLE,
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('qualysync-theme');
        return (stored === 'light' || stored === 'dark') ? stored : 'light';
    }
    return 'light';
  });

  // Boot Sequence Simulation
  useEffect(() => {
    setTimeout(() => setIsBooting(false), 2000);
  }, []);

  useEffect(() => {
    localStorage.setItem('qualysync-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleAgentInstall = (id: string) => {
    setMarketplaceAgents(prev => prev.map(a => a.id === id ? { ...a, installed: !a.installed } : a));
  };

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
      while (!codeApproved && attemptCount < 2) { 
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

      // --- DYNAMIC MARKETPLACE AGENTS ---
      const securityAgent = marketplaceAgents.find(a => a.id === 'sec_01' && a.installed);
      if (securityAgent) {
         setActiveRole(AgentRole.SECURITY); updateStatus(AgentRole.SECURITY, AgentStatus.THINKING);
         addLog(AgentRole.SECURITY, "Running security audit...", 'info');
         const secResult = await runAgentSimulation(AgentRole.SECURITY, workflowContext);
         addLog(AgentRole.SECURITY, "Audit Complete", 'success', secResult.text);
         updateStatus(AgentRole.SECURITY, AgentStatus.SUCCESS);
      }

      const perfAgent = marketplaceAgents.find(a => a.id === 'perf_01' && a.installed);
      if (perfAgent) {
         setActiveRole(AgentRole.PERFORMANCE); updateStatus(AgentRole.PERFORMANCE, AgentStatus.THINKING);
         addLog(AgentRole.PERFORMANCE, "Analyzing performance...", 'info');
         const perfResult = await runAgentSimulation(AgentRole.PERFORMANCE, workflowContext);
         addLog(AgentRole.PERFORMANCE, "Scan Complete", 'success', perfResult.text);
         updateStatus(AgentRole.PERFORMANCE, AgentStatus.SUCCESS);
      }

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
    <div className={`w-20 border-r flex flex-col items-center py-6 gap-4 z-20 overflow-y-auto scrollbar-hide shadow-lg transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('dashboard')}>
        <Sparkles className="text-white" size={20} />
      </div>
      
      <div className="flex flex-col gap-3 w-full items-center flex-grow px-2">
        <SidebarIcon theme={theme} icon={<Activity size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} tooltip="Dashboard" />
        <div className={`w-full h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
        <SidebarIcon theme={theme} icon={<Smartphone size={20} />} active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} tooltip="Responsive Studio" />
        <SidebarIcon theme={theme} icon={<Globe size={20} />} active={activeTab === 'omni'} onClick={() => setActiveTab('omni')} tooltip="OmniScan Tester" />
        <div className={`w-full h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
        <SidebarIcon theme={theme} icon={<Server size={20} />} active={activeTab === 'apilab'} onClick={() => setActiveTab('apilab')} tooltip="API Lab" />
        <SidebarIcon theme={theme} icon={<Shield size={20} />} active={activeTab === 'security'} onClick={() => setActiveTab('security')} tooltip="Security Lab" />
        <SidebarIcon theme={theme} icon={<Zap size={20} />} active={activeTab === 'perf'} onClick={() => setActiveTab('perf')} tooltip="Performance Lab" />
        <SidebarIcon theme={theme} icon={<Database size={20} />} active={activeTab === 'db'} onClick={() => setActiveTab('db')} tooltip="Database Lab" />
        <div className={`w-full h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
        <SidebarIcon theme={theme} icon={<Layers size={20} />} active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} tooltip="Agent Lab" />
        <SidebarIcon theme={theme} icon={<FileCode size={20} />} active={activeTab === 'bridge'} onClick={() => setActiveTab('bridge')} tooltip="Codeless Bridge" />
        <SidebarIcon theme={theme} icon={<ShoppingBag size={20} />} active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} tooltip="Agent Store" />
      </div>
      <div className="mt-auto pt-4 w-full flex justify-center">
         <button 
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all ${
               theme === 'dark' ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
            }`}
         >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
         </button>
      </div>
    </div>
  );

  // Boot Screen
  if (isBooting) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
         <div className="z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 mb-6 animate-bounce">
               <Cpu size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">QualiSync AI</h1>
            <p className="text-slate-400 font-mono text-sm animate-pulse">Initializing Multi-Agent Kernel...</p>
            
            <div className="w-64 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
               <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
            </div>
         </div>
         <style>{`
            @keyframes loading {
               0% { transform: translateX(-100%); }
               100% { transform: translateX(200%); }
            }
         `}</style>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen font-sans selection:bg-blue-500/30 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {renderSidebar()}
      
      <main className="flex-grow flex flex-col overflow-hidden relative">
        {/* Header Overlay */}
        <div className="absolute top-0 right-0 p-4 z-10 pointer-events-none">
          <div className={`flex items-center gap-2 backdrop-blur-md border px-4 py-2 rounded-full text-xs font-medium shadow-sm ${
              theme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white/80 border-slate-200 text-slate-600'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            v3.1 Enterprise
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-grow overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <div className="p-8 h-full overflow-y-auto animate-fade-in">
               <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><LayoutDashboard className="text-blue-600"/> Command Center</h1>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
                  <div className={`col-span-2 p-6 rounded-2xl border shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                      <HeatmapChart data={MOCK_RISK_DATA}/>
                  </div>
                  <div className={`p-6 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Live Signals</h3>
                    <div className="space-y-3">
                      <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex gap-3 items-start">
                         <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16}/> 
                         <div>
                            <span className="text-xs font-bold text-red-600 block">Critical Vulnerability</span>
                            <span className="text-[10px] opacity-70">SQL Injection pattern in login form</span>
                         </div>
                      </div>
                      <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3 items-start">
                         <Zap className="text-amber-500 shrink-0 mt-0.5" size={16}/> 
                         <div>
                            <span className="text-xs font-bold text-amber-600 block">Performance Degraded</span>
                            <span className="text-[10px] opacity-70">LCP exceeded 2.5s on /checkout</span>
                         </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
          
          {activeTab === 'studio' && <ResponsiveStudio />}
          {activeTab === 'omni' && <OmniTester />}
          {activeTab === 'apilab' && <ApiLab />}
          {activeTab === 'security' && <SecurityLab />}
          {activeTab === 'perf' && <PerformanceLab />}
          {activeTab === 'db' && <DatabaseLab />}
          
          {activeTab === 'agents' && (
            <div className="flex h-full animate-fade-in">
              <div className={`w-1/3 border-r p-6 flex flex-col z-10 shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h2 className="text-2xl font-bold mb-4 flex gap-2"><Layers className="text-blue-600" /> Workflow Input</h2>
                <textarea 
                  className={`flex-grow border rounded-xl p-4 mb-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                  value={inputStory} 
                  onChange={(e) => setInputStory(e.target.value)} 
                  placeholder="Describe your test scenario..."
                />
                <button 
                  onClick={startSimulation} 
                  disabled={isRunning} 
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl flex justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? <Activity className="animate-spin"/> : <Play fill="currentColor"/>} 
                  {isRunning ? 'Agents Working...' : 'Initialize Swarm'}
                </button>
              </div>
              <div className={`w-2/3 flex flex-col ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <div className={`h-3/5 p-6 border-b relative ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="absolute top-4 left-4 text-xs font-mono opacity-50">VISUALIZER_V3.0</div>
                    <AgentVisualizer activeRole={activeRole} statuses={agentStatuses} />
                </div>
                <div className={`h-2/5 p-0 overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-900 text-slate-300'}`}>
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-xs font-mono text-slate-500">
                     <span className="flex items-center gap-2"><Terminal size={12}/> SYSTEM_LOGS</span>
                     <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> LIVE</span>
                  </div>
                  <div className="p-4 overflow-y-auto font-mono text-xs space-y-3 flex-grow custom-scrollbar">
                    {logs.map(log => (
                      <div key={log.id} className="animate-slide-in flex gap-3">
                        <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                        <div className="flex-grow">
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                                 log.role === AgentRole.CRITIC ? 'bg-red-500/20 text-red-400' : 
                                 log.role === AgentRole.HEALER ? 'bg-purple-500/20 text-purple-400' :
                                 'bg-blue-500/20 text-blue-400'
                              }`}>
                                 {log.role}
                              </span>
                           </div>
                           <div className={`${log.type === 'error' ? 'text-red-400' : 'text-slate-300'}`}>{log.message}</div>
                           {log.content && (
                             <div className="mt-2 p-3 rounded bg-slate-900/50 border border-slate-800 text-slate-400 overflow-x-auto">
                               {log.content}
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'bridge' && <CodelessBridge />}
          {activeTab === 'memory' && <VectorMemory />}
          {activeTab === 'marketplace' && <Marketplace agents={marketplaceAgents} onToggle={toggleAgentInstall} />}
          {activeTab === 'data' && <SyntheticData />}
          {activeTab === 'vision' && <VisualEye />}
          {activeTab === 'roadmap' && <Roadmap />}
          {activeTab === 'settings' && <IntegrationsSettings />}
        </div>

        {/* System Status Footer */}
        <div className={`h-8 border-t flex items-center px-4 justify-between text-[10px] font-mono select-none ${
           theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
        }`}>
           <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> SYSTEMS_NOMINAL</span>
              <span className="flex items-center gap-1.5"><Wifi size={10}/> CONNECTED</span>
           </div>
           <div className="flex gap-4">
              <span>MEM: 402MB</span>
              <span>CPU: {isRunning ? '45%' : '2%'}</span>
              <span>AGENTS: {marketplaceAgents.filter(a=>a.installed).length + 5} ACTIVE</span>
           </div>
        </div>

      </main>
    </div>
  );
};

const SidebarIcon = ({ icon, active, onClick, tooltip, theme }: any) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all group relative duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
        : theme === 'dark' ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
  }`}>
    {icon} 
    <div className={`absolute left-16 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 shadow-xl border pointer-events-none z-50 whitespace-nowrap transition-all duration-200 transform translate-x-[-10px] group-hover:translate-x-0 ${
        theme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-slate-200'
    }`}>
      {tooltip}
      {/* Little arrow */}
      <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 border-b border-l ${
         theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}></div>
    </div>
  </button>
);

export default App;
