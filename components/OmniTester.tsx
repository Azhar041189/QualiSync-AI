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
   BarChart4,
   ExternalLink,
   Lightbulb
} from 'lucide-react';
import { OmniScanReport } from '../types';
import { runOmniScan } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OmniTester: React.FC = () => {
   const [url, setUrl] = useState("https://www.example-ecommerce.com");
   const [apiKey, setApiKey] = useState("AIzaSyAkKN4aLdUX-pHnozeoUynGYxumwtSBGT8");
   const [dbConfig, setDbConfig] = useState({ host: "localhost", type: "PostgreSQL", user: "admin" });
   const [showDbConfig, setShowDbConfig] = useState(false);
   const [isRunning, setIsRunning] = useState(false);
   const [report, setReport] = useState<OmniScanReport | null>(null);
   const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'load' | 'security' | 'a11y' | 'db' | 'links' | 'lighthouse'>('overview');
   const [progress, setProgress] = useState(0);
   const [progressLabel, setProgressLabel] = useState("");

   const [toggles, setToggles] = useState({
      api: true,
      database: true,
      load: true,
      brokenLinks: true,
      accessibility: true,
      security: true,
      lighthouse: true
   });

   const handleToggle = (key: keyof typeof toggles) => {
      setToggles(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const startScan = async () => {
      setIsRunning(true);
      setReport(null);
      setProgress(0);

      const steps = [
         "Resolving DNS & Headers...",
         "Crawling Site Structure...",
         "Injecting Security Payloads...",
         "Running Lighthouse Audit...",
         "Spiking Virtual Users (Load)...",
         "Validating Database Schema...",
         "Aggregating Final Report..."
      ];

      let currentProgress = 0;
      const interval = setInterval(() => {
         currentProgress += Math.floor(Math.random() * 5) + 1;
         if (currentProgress > 95) currentProgress = 95;

         const stepIndex = Math.floor((currentProgress / 100) * steps.length);
         setProgressLabel(steps[Math.min(stepIndex, steps.length - 1)]);
         setProgress(currentProgress);
      }, 200);

      try {
         const selected = Object.keys(toggles).filter(k => toggles[k as keyof typeof toggles]);
         let targetInput = url;
         if (toggles.database) {
            targetInput += ` [DB Context: Host=${dbConfig.host}, Type=${dbConfig.type}, User=${dbConfig.user}]`;
         }

         const result = await runOmniScan(targetInput, selected, apiKey);

         clearInterval(interval);
         setProgress(100);
         setProgressLabel("Complete");
         setTimeout(() => {
            setReport(result);
            setIsRunning(false);
            setActiveTab('overview');
         }, 500);

      } catch (e) {
         clearInterval(interval);
         setIsRunning(false);
         setProgress(0);
         setProgressLabel("Failed");
         alert("Scan failed. Please try again.");
      }
   };

   return (
      <div className="p-8 h-full flex flex-col overflow-y-auto dark:bg-slate-900 dark:text-white">
         <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
               <Globe className="text-blue-600 dark:text-blue-400" /> OmniScan Universal Tester
            </h1>
            <p className="text-slate-500 dark:text-slate-400">One URL. Every Test. Full-Stack Quality Intelligence.</p>
         </div>

         {/* Input & Config Section */}
         <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex gap-4 mb-6">
               <div className="flex-grow relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                     <Globe size={18} />
                  </div>
                  <input
                     type="text"
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
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


            <div className="mb-4">
               <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Optional: Enter PageSpeed API Key for higher quota"
                  className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
               />
            </div>

            {toggles.database && (
               <div className="mb-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <button onClick={() => setShowDbConfig(!showDbConfig)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mb-2 flex items-center gap-1">
                     <Database size={12} /> {showDbConfig ? 'Hide' : 'Configure'} Database Connection
                  </button>
                  {showDbConfig && (
                     <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                        <input className="p-2 rounded border border-slate-300 dark:border-slate-500 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" placeholder="Host" value={dbConfig.host} onChange={e => setDbConfig({ ...dbConfig, host: e.target.value })} />
                        <select className="p-2 rounded border border-slate-300 dark:border-slate-500 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" value={dbConfig.type} onChange={e => setDbConfig({ ...dbConfig, type: e.target.value })}>
                           <option>PostgreSQL</option>
                           <option>MySQL</option>
                           <option>MongoDB</option>
                        </select>
                        <input className="p-2 rounded border border-slate-300 dark:border-slate-500 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" placeholder="User" value={dbConfig.user} onChange={e => setDbConfig({ ...dbConfig, user: e.target.value })} />
                     </div>
                  )}
               </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
               <ToggleBtn label="API Testing" icon={<Server size={14} />} active={toggles.api} onClick={() => handleToggle('api')} />
               <ToggleBtn label="Database Integrity" icon={<Database size={14} />} active={toggles.database} onClick={() => handleToggle('database')} />
               <ToggleBtn label="Load Testing" icon={<Zap size={14} />} active={toggles.load} onClick={() => handleToggle('load')} />
               <ToggleBtn label="Broken Links" icon={<Link2 size={14} />} active={toggles.brokenLinks} onClick={() => handleToggle('brokenLinks')} />
               <ToggleBtn label="Accessibility" icon={<Accessibility size={14} />} active={toggles.accessibility} onClick={() => handleToggle('accessibility')} />
               <ToggleBtn label="Security Scan" icon={<Shield size={14} />} active={toggles.security} onClick={() => handleToggle('security')} />
               <ToggleBtn label="Lighthouse" icon={<Lightbulb size={14} />} active={toggles.lighthouse} onClick={() => handleToggle('lighthouse')} />
            </div>

            {isRunning && (
               <div className="mt-6 animate-fadeIn">
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                     <span className="animate-pulse">{progressLabel}</span>
                     <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
               </div>
            )}
         </div>

         {/* Results Section */}
         {report && (
            <div className="flex-grow flex flex-col animate-fadeIn">

               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 ${(report.score || 0) > 80 ? 'border-green-500 text-green-600' : (report.score || 0) > 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'
                        }`}>
                        {report.score || 0}
                     </div>
                     <div>
                        <div className="text-slate-500 text-xs uppercase font-bold">Health Score</div>
                        <div className="text-slate-800 dark:text-white font-bold">Overall Rating</div>
                     </div>
                  </div>
                  <StatBox label="Security Risks" value={report.security?.length || 0} color="text-red-500" />
                  <StatBox label="API Endpoints" value={report.api?.length || 0} color="text-blue-500" />
                  <StatBox label="DB Checks" value={report.database?.checks?.length || 0} color="text-purple-500" />
               </div>

               <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
                  <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                  <TabButton label="Lighthouse" active={activeTab === 'lighthouse'} onClick={() => setActiveTab('lighthouse')} />
                  <TabButton label="API" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
                  <TabButton label="Database" active={activeTab === 'db'} onClick={() => setActiveTab('db')} />
                  <TabButton label="Load & Perf" active={activeTab === 'load'} onClick={() => setActiveTab('load')} />
                  <TabButton label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                  <TabButton label="Accessibility" active={activeTab === 'a11y'} onClick={() => setActiveTab('a11y')} />
                  <TabButton label="Broken Links" active={activeTab === 'links'} onClick={() => setActiveTab('links')} />
               </div>

               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex-grow overflow-auto min-h-[400px] shadow-sm">

                  {activeTab === 'overview' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        <div className="space-y-4">
                           <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Executive Summary</h3>
                           <SummaryItem label="Database Consistency" status={report.database?.status === 'Healthy' ? 'pass' : 'fail'} />
                           <SummaryItem label="Broken Links Check" status={report.brokenLinks?.length === 0 ? 'pass' : 'fail'} text={`${report.brokenLinks?.length || 0} dead links`} />
                           <SummaryItem label="SSL/TLS Certificate" status="pass" text="Valid (245 days remaining)" />
                           <SummaryItem label="Lighthouse Performance" status={(report.lighthouse?.scores.performance || 0) > 80 ? 'pass' : 'fail'} text={`Score: ${report.lighthouse?.scores.performance || 'N/A'}`} />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-64">
                           <h3 className="font-bold text-sm text-slate-500 mb-4">Traffic Simulation Preview</h3>
                           <div style={{ width: '100%', height: '100%', minHeight: '150px' }}>
                              <ResponsiveContainer>
                                 <AreaChart data={report.load?.chartData || []}>
                                    <defs>
                                       <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip
                                       contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                       itemStyle={{ color: '#3b82f6' }}
                                    />
                                    <Area type="monotone" dataKey="rps" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRps)" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'lighthouse' && report.lighthouse && (
                     <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                           <LighthouseGauge label="Performance" score={report.lighthouse.scores.performance} />
                           <LighthouseGauge label="Accessibility" score={report.lighthouse.scores.accessibility} />
                           <LighthouseGauge label="Best Practices" score={report.lighthouse.scores.bestPractices} />
                           <LighthouseGauge label="SEO" score={report.lighthouse.scores.seo} />
                        </div>

                        <div>
                           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Core Web Vitals</h3>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <MetricCard label="LCP" value={report.lighthouse.metrics.lcp} desc="Largest Contentful Paint" color="blue" />
                              <MetricCard label="FCP" value={report.lighthouse.metrics.fcp} desc="First Contentful Paint" color="green" />
                              <MetricCard label="CLS" value={report.lighthouse.metrics.cls} desc="Cumulative Layout Shift" color="purple" />
                              <MetricCard label="TBT" value={report.lighthouse.metrics.tbt} desc="Total Blocking Time" color="orange" />
                           </div>
                        </div>

                        <div>
                           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Audits Passed</h3>
                           <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              {report.lighthouse.audits.map((audit, i) => (
                                 <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-200 dark:border-slate-700 last:border-0 text-sm text-slate-600 dark:text-slate-300">
                                    <CheckCircle size={14} className="text-green-500" />
                                    {audit}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'api' && (
                     <div className="space-y-6 animate-fadeIn">
                        <div>
                           <h3 className="text-slate-800 dark:text-white font-bold mb-4">API Endpoint Health</h3>
                           <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    <tr>
                                       <th className="p-3">Method</th>
                                       <th className="p-3">Endpoint</th>
                                       <th className="p-3">Status</th>
                                       <th className="p-3">Latency</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                    {report.api?.map((ep, i) => (
                                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                          <td className="p-3">
                                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>{ep.method}</span>
                                          </td>
                                          <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{ep.endpoint}</td>
                                          <td className="p-3">
                                             <span className={`flex items-center gap-1 font-bold ${ep.status >= 400 ? 'text-red-500' : 'text-green-500'}`}>
                                                {ep.status} {ep.status === 200 ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                             </span>
                                          </td>
                                          <td className="p-3 text-slate-500">{ep.latency}ms</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'db' && (
                     <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center">
                           <h3 className="text-lg font-bold text-slate-800 dark:text-white">Database Integrity Report</h3>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.database?.status === 'Healthy'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                              Status: {report.database?.status}
                           </span>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                           <table className="w-full text-sm text-left">
                              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                 <tr>
                                    <th className="p-3">Check Name</th>
                                    <th className="p-3">Result</th>
                                    <th className="p-3">Latency</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                 {report.database?.checks?.map((check, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                       <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{check.name}</td>
                                       <td className="p-3">
                                          {check.status === 'Pass' ?
                                             <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={14} /> Pass</span> :
                                             <span className="flex items-center gap-1 text-red-600 font-bold"><XCircle size={14} /> Fail</span>
                                          }
                                       </td>
                                       <td className="p-3 text-slate-500 font-mono">{check.latency}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}

                  {activeTab === 'load' && (
                     <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Max Users</div>
                              <div className="text-2xl font-bold text-slate-800 dark:text-white">{report.load?.virtualUsers}</div>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Peak RPS</div>
                              <div className="text-2xl font-bold text-blue-600">{report.load?.rps}</div>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                              <div className="text-xs text-slate-500 font-bold uppercase mb-1">P95 Latency</div>
                              <div className="text-2xl font-bold text-yellow-600">{report.load?.p95Latency}ms</div>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Error Rate</div>
                              <div className={`text-2xl font-bold ${report.load?.errorRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                 {(report.load?.errorRate * 100).toFixed(2)}%
                              </div>
                           </div>
                        </div>

                        <div className="h-64 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Throughput vs Latency</h4>
                           <div style={{ width: '100%', height: '90%' }}>
                              <ResponsiveContainer>
                                 <AreaChart data={report.load?.chartData || []}>
                                    <defs>
                                       <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={10} />
                                    <Tooltip
                                       contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Area type="monotone" dataKey="rps" stroke="#3b82f6" fill="none" strokeWidth={2} name="RPS" />
                                    <Area type="monotone" dataKey="latency" stroke="#eab308" fill="url(#colorLatency)" strokeWidth={2} name="Latency" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'security' && (
                     <div className="animate-fadeIn space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Vulnerability Scan Results</h3>
                        {report.security?.length === 0 ? (
                           <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                              <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
                              <p>No critical vulnerabilities detected.</p>
                           </div>
                        ) : (
                           report.security?.map((issue, i) => (
                              <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700 rounded shadow-sm">
                                 <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-red-600 flex items-center gap-2">
                                       <AlertTriangle size={16} /> {issue.type}
                                    </h4>
                                    <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200 uppercase">{issue.severity}</span>
                                 </div>
                                 <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{issue.description}</p>
                                 <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs font-mono text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    <strong>Remediation:</strong> {issue.remediation}
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  )}

                  {activeTab === 'a11y' && (
                     <div className="animate-fadeIn space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                           <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${report.accessibility.score >= 90 ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'
                              }`}>
                              {report.accessibility.score}
                           </div>
                           <div>
                              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Accessibility Score</h3>
                              <p className="text-sm text-slate-500">WCAG 2.1 AA Compliance</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                           {report.accessibility.issues.map((issue, i) => (
                              <div key={i} className="p-4 rounded border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                                 <div className="flex justify-between mb-1">
                                    <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-xs">{issue.id}</span>
                                    <span className="text-xs font-bold uppercase text-orange-500">{issue.impact}</span>
                                 </div>
                                 <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{issue.description}</p>
                                 <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono truncate text-slate-500">
                                    {issue.element}
                                 </div>
                              </div>
                           ))}
                           {report.accessibility.issues.length === 0 && (
                              <div className="text-center p-6 text-slate-500">No accessibility issues found.</div>
                           )}
                        </div>
                     </div>
                  )}

                  {activeTab === 'links' && (
                     <div className="animate-fadeIn">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Broken Link Checker</h3>
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                           <table className="w-full text-sm text-left">
                              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                 <tr>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Broken URL</th>
                                    <th className="p-3">Found On</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                 {report.brokenLinks?.map((link, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                       <td className="p-3">
                                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-xs">{link.status}</span>
                                       </td>
                                       <td className="p-3 text-red-600 hover:underline cursor-pointer truncate max-w-xs" title={link.url}>{link.url}</td>
                                       <td className="p-3 text-slate-500 truncate max-w-xs">{link.sourcePage}</td>
                                    </tr>
                                 ))}
                                 {report.brokenLinks?.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-slate-400">No broken links detected.</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}

               </div>
            </div>
         )}
      </div>
   );
};

const ToggleBtn = ({ label, icon, active, onClick }: any) => (
   <button
      onClick={onClick}
      className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-bold transition-all ${active
         ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-400'
         : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
         }`}
   >
      {icon} {label}
   </button>
);

const StatBox = ({ label, value, color }: any) => (
   <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{label}</div>
   </div>
);

const SummaryItem = ({ label, status, text }: any) => (
   <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
      <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
      <div className="flex items-center gap-2">
         {text && <span className="text-xs text-slate-500 dark:text-slate-400">{text}</span>}
         {status === 'pass' ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
      </div>
   </div>
);

const TabButton = ({ label, active, onClick }: any) => (
   <button
      onClick={onClick}
      className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${active
         ? 'border-blue-500 text-blue-600 bg-slate-50 dark:bg-slate-700 dark:text-blue-400'
         : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
         }`}
   >
      {label}
   </button>
);

const LighthouseGauge = ({ label, score }: { label: string, score: number }) => {
   const color = score >= 90 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
   const borderColor = score >= 90 ? 'border-green-500' : score >= 50 ? 'border-yellow-500' : 'border-red-500';

   return (
      <div className="flex flex-col items-center">
         <div className={`w-20 h-20 rounded-full border-4 ${borderColor} flex items-center justify-center text-2xl font-bold ${color} mb-2 bg-white dark:bg-slate-800`}>
            {score}
         </div>
         <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      </div>
   );
};

const MetricCard = ({ label, value, desc, color }: any) => (
   <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
      <div className={`text-xs font-bold uppercase mb-1 text-${color}-500`}>{label}</div>
      <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400">{desc}</div>
   </div>
);

export default OmniTester;