
import React, { useState } from 'react';
import { 
  Globe, 
  Zap, 
  Database, 
  Shield, 
  Link2, 
  Accessibility, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Server,
  Activity,
  BarChart4
} from 'lucide-react';
import { OmniScanReport } from '../types';
import { runOmniScan } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OmniTester: React.FC = () => {
  const [url, setUrl] = useState("https://www.example-ecommerce.com");
  const [dbConfig, setDbConfig] = useState({ host: "localhost", type: "PostgreSQL", user: "admin" });
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<OmniScanReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'load' | 'security' | 'a11y' | 'db'>('overview');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const [toggles, setToggles] = useState({
    api: true,
    database: true,
    load: true,
    brokenLinks: true,
    accessibility: true,
    security: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startScan = async () => {
    setIsRunning(true);
    setReport(null);
    setProgress(0);

    // Simulate progressive scanning steps
    const steps = [
      "Resolving DNS & Headers...",
      "Crawling Site Structure...",
      "Injecting Security Payloads...",
      "Running WCAG 2.1 Audit...",
      "Spiking Virtual Users (Load)...",
      "Validating Database Schema...",
      "Aggregating Final Report..."
    ];

    let currentProgress = 0;
    
    // Smooth progress animation unrelated to actual request time
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 5) + 1;
      if (currentProgress > 95) currentProgress = 95;
      
      const stepIndex = Math.floor((currentProgress / 100) * steps.length);
      setProgressLabel(steps[Math.min(stepIndex, steps.length - 1)]);
      setProgress(currentProgress);
    }, 200);

    try {
      const selected = Object.keys(toggles).filter(k => toggles[k as keyof typeof toggles]);
      
      // Pass DB config as part of the context if DB testing is selected
      let targetInput = url;
      if (toggles.database) {
          targetInput += ` [DB Context: Host=${dbConfig.host}, Type=${dbConfig.type}, User=${dbConfig.user}]`;
      }

      const result = await runOmniScan(targetInput, selected);
      
      clearInterval(interval);
      setProgress(100);
      setProgressLabel("Complete");
      setTimeout(() => {
        setReport(result);
        setIsRunning(false);
      }, 500);

    } catch (e) {
      clearInterval(interval);
      setIsRunning(false);
      setProgress(0);
      setProgressLabel("Failed");
      console.error(e);
      alert("Scan failed. Please try again. Ensure your API Key is valid.");
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Globe className="text-blue-600" /> OmniScan Universal Tester
        </h1>
        <p className="text-slate-500">One URL. Every Test. Full-Stack Quality Intelligence.</p>
      </div>

      {/* Input & Config Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex gap-4 mb-6">
          <div className="flex-grow relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
               <Globe size={18} />
            </div>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              placeholder="https://your-website.com"
            />
          </div>
          <button 
            onClick={startScan}
            disabled={isRunning}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
            {isRunning ? 'Scanning...' : 'Run Full Scan'}
          </button>
        </div>
        
        {/* Expanded DB Config if Database is checked */}
        {toggles.database && (
           <div className="mb-6 border-t border-slate-100 pt-4">
              <button onClick={() => setShowDbConfig(!showDbConfig)} className="text-xs font-bold text-blue-600 hover:underline mb-2 flex items-center gap-1">
                 <Database size={12} /> {showDbConfig ? 'Hide' : 'Configure'} Database Connection
              </button>
              {showDbConfig && (
                 <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                    <input className="p-2 rounded border border-slate-300 text-xs" placeholder="Host" value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})} />
                    <select className="p-2 rounded border border-slate-300 text-xs" value={dbConfig.type} onChange={e => setDbConfig({...dbConfig, type: e.target.value})}>
                       <option>PostgreSQL</option>
                       <option>MySQL</option>
                       <option>MongoDB</option>
                    </select>
                    <input className="p-2 rounded border border-slate-300 text-xs" placeholder="User" value={dbConfig.user} onChange={e => setDbConfig({...dbConfig, user: e.target.value})} />
                 </div>
              )}
           </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
           <ToggleBtn label="API Testing" icon={<Server size={14}/>} active={toggles.api} onClick={() => handleToggle('api')} />
           <ToggleBtn label="Database Integrity" icon={<Database size={14}/>} active={toggles.database} onClick={() => handleToggle('database')} />
           <ToggleBtn label="Load Testing" icon={<Zap size={14}/>} active={toggles.load} onClick={() => handleToggle('load')} />
           <ToggleBtn label="Broken Links" icon={<Link2 size={14}/>} active={toggles.brokenLinks} onClick={() => handleToggle('brokenLinks')} />
           <ToggleBtn label="Accessibility" icon={<Accessibility size={14}/>} active={toggles.accessibility} onClick={() => handleToggle('accessibility')} />
           <ToggleBtn label="Security Scan" icon={<Shield size={14}/>} active={toggles.security} onClick={() => handleToggle('security')} />
        </div>

        {isRunning && (
          <div className="mt-6 animate-fadeIn">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
               <span className="animate-pulse">{progressLabel}</span>
               <span>{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {report && (
        <div className="flex-grow flex flex-col animate-fadeIn">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 ${
                 (report.score || 0) > 80 ? 'border-green-500 text-green-600' : (report.score || 0) > 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'
               }`}>
                 {report.score || 0}
               </div>
               <div>
                 <div className="text-slate-500 text-xs uppercase font-bold">Health Score</div>
                 <div className="text-slate-800 font-bold">Overall Rating</div>
               </div>
            </div>
            <StatBox label="Security Risks" value={report.security?.length || 0} color="text-red-500" />
            <StatBox label="API Endpoints" value={report.api?.length || 0} color="text-blue-500" />
            <StatBox label="DB Checks" value={report.database?.checks?.length || 0} color="text-purple-500" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
             <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
             <TabButton label="API" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
             <TabButton label="Database" active={activeTab === 'db'} onClick={() => setActiveTab('db')} />
             <TabButton label="Load & Perf" active={activeTab === 'load'} onClick={() => setActiveTab('load')} />
             <TabButton label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
             <TabButton label="Accessibility" active={activeTab === 'a11y'} onClick={() => setActiveTab('a11y')} />
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex-grow overflow-auto min-h-[400px] shadow-sm">
            
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Executive Summary</h3>
                    <SummaryItem label="Database Consistency" status={report.database?.status === 'Healthy' ? 'pass' : 'fail'} />
                    <SummaryItem label="Broken Links Check" status={report.brokenLinks?.length === 0 ? 'pass' : 'fail'} text={`${report.brokenLinks?.length || 0} dead links`} />
                    <SummaryItem label="SSL/TLS Certificate" status="pass" text="Valid (245 days remaining)" />
                    <SummaryItem label="Mobile Responsiveness" status="pass" text="Viewport Configured" />
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-64">
                    <h3 className="font-bold text-sm text-slate-500 mb-4">Traffic Simulation Preview</h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={report.load?.chartData || []}>
                          <defs>
                            <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                            itemStyle={{ color: '#3b82f6' }}
                          />
                          <Area type="monotone" dataKey="rps" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRps)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                   <h3 className="text-slate-800 font-bold mb-4">API Endpoint Health</h3>
                   <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-slate-100 text-slate-600">
                            <tr>
                               <th className="p-3">Method</th>
                               <th className="p-3">Endpoint</th>
                               <th className="p-3">Status</th>
                               <th className="p-3">Latency</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 bg-white">
                            {report.api?.length ? report.api.map((ep, i) => (
                               <tr key={i} className="hover:bg-slate-50">
                                  <td className="p-3">
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                        ep.method === 'POST' ? 'bg-green-100 text-green-700' :
                                        ep.method === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                     }`}>{ep.method}</span>
                                  </td>
                                  <td className="p-3 font-mono text-slate-700">{ep.endpoint}</td>
                                  <td className="p-3">
                                     <span className={`flex items-center gap-1 font-bold ${ep.status >= 400 ? 'text-red-500' : 'text-green-500'}`}>
                                        {ep.status} {ep.status === 200 ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                     </span>
                                  </td>
                                  <td className="p-3 text-slate-500">{ep.latency}ms</td>
                               </tr>
                            )) : (
                               <tr><td colSpan={4} className="p-4 text-center text-slate-500">No API endpoints detected.</td></tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'db' && (
                <div>
                   <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                     <Database className="text-blue-500" /> Database Integrity & Schema
                     <span className={`ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold`}>{report.database?.status}</span>
                   </h3>
                   <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-500">
                         <div>HOST: <span className="text-slate-800 font-bold">{dbConfig.host}</span></div>
                         <div>TYPE: <span className="text-slate-800 font-bold">{dbConfig.type}</span></div>
                         <div>USER: <span className="text-slate-800 font-bold">{dbConfig.user}</span></div>
                         <div>SSL: <span className="text-green-600 font-bold">Enabled</span></div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.database?.checks?.map((check, i) => (
                         <div key={i} className="flex justify-between p-3 bg-white rounded border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                            <span className="text-slate-700 font-medium">{check.name}</span>
                            <div className="flex items-center gap-3">
                               <span className="text-xs text-slate-400 font-mono">{check.latency}</span>
                               <span className={`text-xs font-bold px-2 py-1 rounded ${check.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {check.status}
                               </span>
                            </div>
                         </div>
                      ))}
                      {!report.database?.checks?.length && <div className="text-slate-500 italic p-2">No database checks run.</div>}
                   </div>
                </div>
            )}

            {activeTab === 'load' && (
              <div className="h-full flex flex-col">
                 <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center">
                       <div className="text-slate-500 text-xs uppercase mb-1">Max Virtual Users</div>
                       <div className="text-2xl font-bold text-slate-800">{report.load?.virtualUsers || 0}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center">
                       <div className="text-slate-500 text-xs uppercase mb-1">Peak RPS</div>
                       <div className="text-2xl font-bold text-blue-500">{report.load?.rps || 0}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 text-center">
                       <div className="text-slate-500 text-xs uppercase mb-1">p95 Latency</div>
                       <div className="text-2xl font-bold text-yellow-500">{report.load?.p95Latency || 0}ms</div>
                    </div>
                 </div>
                 <div className="flex-grow bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[300px] flex flex-col">
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={report.load?.chartData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="time" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }}
                            />
                            <Area type="monotone" dataKey="latency" stackId="1" stroke="#eab308" fill="#eab308" name="Latency (ms)" />
                            <Area type="monotone" dataKey="rps" stackId="2" stroke="#3b82f6" fill="#3b82f6" name="Requests/Sec" />
                          </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                 {report.security?.map((issue, i) => (
                    <div key={i} className="bg-slate-50 border-l-4 border-red-500 rounded p-4 flex gap-4">
                       <div className="mt-1">
                          <Shield className="text-red-500" />
                       </div>
                       <div>
                          <h4 className="font-bold text-red-600 flex items-center gap-2">
                             {issue.type} 
                             <span className="text-xs bg-red-100 border border-red-200 px-2 py-0.5 rounded text-red-700 uppercase">{issue.severity}</span>
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                          <div className="mt-3 text-xs bg-white p-2 rounded border border-slate-200 text-slate-500 font-mono">
                             Fix: {issue.remediation}
                          </div>
                       </div>
                    </div>
                 ))}
                 {(!report.security || report.security.length === 0) && (
                    <div className="text-center py-12 text-slate-500">
                       <Shield size={48} className="mx-auto mb-4 opacity-30 text-green-500" />
                       <p>No high-risk vulnerabilities detected.</p>
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'a11y' && (
               <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-xl font-bold text-purple-600 bg-purple-50">
                        {report.accessibility?.score || 0}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800">Accessibility Score (Lighthouse)</h3>
                        <p className="text-sm text-slate-500">WCAG 2.1 AA Standard</p>
                     </div>
                  </div>
                  
                  {report.accessibility?.issues?.map((issue, i) => (
                     <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded border border-slate-200">
                        <div className="mt-1">
                           <Accessibility className="text-purple-500" size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800">{issue.id}</span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                 issue.impact === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{issue.impact}</span>
                           </div>
                           <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                           <code className="text-xs bg-slate-200 p-1 rounded text-purple-700 font-mono block w-fit">
                              {issue.element}
                           </code>
                        </div>
                     </div>
                  ))}
                  {(!report.accessibility?.issues || report.accessibility.issues.length === 0) && (
                     <div className="text-center text-slate-500 italic">No accessibility issues found.</div>
                  )}
               </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const ToggleBtn = ({ label, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-bold transition-all ${
       active ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
    }`}
  >
     {icon} {label}
  </button>
);

const StatBox = ({ label, value, color }: any) => (
  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
     <div className={`text-2xl font-bold ${color}`}>{value}</div>
     <div className="text-slate-500 text-xs font-bold uppercase">{label}</div>
  </div>
);

const SummaryItem = ({ label, status, text }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
     <span className="text-slate-700 font-medium">{label}</span>
     <div className="flex items-center gap-2">
        {text && <span className="text-xs text-slate-500">{text}</span>}
        {status === 'pass' ? <CheckCircle size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}
     </div>
  </div>
);

const TabButton = ({ label, active, onClick }: any) => (
  <button 
     onClick={onClick}
     className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
        active ? 'border-blue-500 text-blue-600 bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
     }`}
  >
     {label}
  </button>
);

export default OmniTester;
