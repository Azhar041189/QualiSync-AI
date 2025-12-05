
import React, { useState } from 'react';
import { Zap, Activity, Users, Clock, StopCircle, Play, Gauge, BarChart, Server, Globe, Smartphone, Monitor, BarChart2, Video, List, History, Layout, Timer } from 'lucide-react';
import { runPerformanceSimulation, runLighthouseSimulation } from '../services/geminiService';
import { PerformanceMetric, GTMetrixReport, WaterfallRequest } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const PerformanceLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'load' | 'lighthouse'>('lighthouse');

  // Load Testing State
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [vus, setVus] = useState(500);

  // GTMetrix/Lighthouse State
  const [targetUrl, setTargetUrl] = useState("https://heartlandroofingandsiding.com");
  const [gtReport, setGtReport] = useState<GTMetrixReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'performance' | 'structure' | 'waterfall' | 'video' | 'history'>('summary');
  
  // Configuration State
  const [location, setLocation] = useState("Vancouver, Canada");
  const [device, setDevice] = useState("Chrome (Desktop) 117.0");
  
  // --- Handlers ---
  const startLoadTest = async () => {
    setIsRunning(true);
    setMetrics([]);
    const data = await runPerformanceSimulation({ vus, duration: '1m' });
    // Simulate streaming data
    for (let i = 0; i < data.length; i++) {
        await new Promise(r => setTimeout(r, 200));
        setMetrics(prev => [...prev, data[i]]);
    }
    setIsRunning(false);
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setGtReport(null);
    try {
      const report = await runLighthouseSimulation(targetUrl);
      setGtReport(report);
      setActiveSubTab('summary');
    } catch (e) {
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render Helpers ---
  const getGradeColor = (grade: string) => {
    if (['A', 'B'].includes(grade)) return 'text-green-600 border-green-500';
    if (['C'].includes(grade)) return 'text-yellow-600 border-yellow-500';
    return 'text-red-600 border-red-500';
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Zap className="text-yellow-500" /> Performance Lab
          </h1>
          <p className="text-slate-500">Dual-Engine Performance Suite: Distributed Load Testing & Web Vitals Analysis.</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="bg-white border border-slate-200 p-1 rounded-lg flex shadow-sm">
           <button 
             onClick={() => setActiveMode('lighthouse')}
             className={`px-4 py-2 text-sm font-bold rounded transition-colors flex items-center gap-2 ${activeMode === 'lighthouse' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Gauge size={16}/> GTmetrix Analyzer
           </button>
           <button 
             onClick={() => setActiveMode('load')}
             className={`px-4 py-2 text-sm font-bold rounded transition-colors flex items-center gap-2 ${activeMode === 'load' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Server size={16}/> Load Tester
           </button>
        </div>
      </div>

      {/* --- GTMETRIX ANALYZER MODE --- */}
      {activeMode === 'lighthouse' && (
        <div className="animate-fadeIn space-y-6">
           {/* Input Bar */}
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex gap-4">
                <input 
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="Enter URL to analyze..."
                />
                <button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              
              {/* Configuration Bar */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 items-center">
                 <span className="font-bold text-slate-400 uppercase tracking-wider">Analysis Options:</span>
                 <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-slate-200">
                    <Globe size={14} className="text-blue-500" />
                    <select className="bg-transparent border-none outline-none font-medium cursor-pointer" value={location} onChange={e => setLocation(e.target.value)}>
                       <option>Vancouver, Canada</option>
                       <option>London, UK</option>
                       <option>San Antonio, USA</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-slate-200">
                    <Monitor size={14} className="text-blue-500" />
                    <select className="bg-transparent border-none outline-none font-medium cursor-pointer" value={device} onChange={e => setDevice(e.target.value)}>
                       <option>Chrome (Desktop) 117.0</option>
                       <option>Firefox (Desktop) 115.0</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-slate-200">
                    <Activity size={14} className="text-blue-500" />
                    <select className="bg-transparent border-none outline-none font-medium cursor-pointer">
                       <option>Unthrottled Connection</option>
                       <option>Cable (20/5 Mbps, 28ms)</option>
                    </select>
                 </div>
              </div>
           </div>

           {gtReport && (
             <div className="animate-fadeIn bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {/* Report Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
                   <ReportTab label="Summary" icon={<List size={14}/>} active={activeSubTab === 'summary'} onClick={() => setActiveSubTab('summary')} />
                   <ReportTab label="Performance" icon={<Timer size={14}/>} active={activeSubTab === 'performance'} onClick={() => setActiveSubTab('performance')} />
                   <ReportTab label="Structure" icon={<Layout size={14}/>} active={activeSubTab === 'structure'} onClick={() => setActiveSubTab('structure')} />
                   <ReportTab label="Waterfall" icon={<BarChart2 size={14}/>} active={activeSubTab === 'waterfall'} onClick={() => setActiveSubTab('waterfall')} />
                   <ReportTab label="Video" icon={<Video size={14}/>} active={activeSubTab === 'video'} onClick={() => setActiveSubTab('video')} />
                   <ReportTab label="History" icon={<History size={14}/>} active={activeSubTab === 'history'} onClick={() => setActiveSubTab('history')} />
                </div>

                <div className="p-6 bg-white flex-grow">
                   {/* SUB-TAB: SUMMARY */}
                   {activeSubTab === 'summary' && (
                     <div className="animate-fadeIn">
                        {/* Top Section: Grades & Speed Visualization */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                           
                           {/* Main Grade Card */}
                           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                              <h3 className="text-slate-500 font-bold text-xs uppercase mb-4 flex items-center gap-2">
                                <Gauge size={14} /> GTmetrix Grade
                              </h3>
                              <div className="flex items-center gap-6">
                                 <div className={`w-24 h-24 rounded-xl border-4 flex items-center justify-center text-5xl font-black ${getGradeColor(gtReport.gtmetrixGrade)}`}>
                                    {gtReport.gtmetrixGrade}
                                 </div>
                                 <div className="space-y-3 flex-grow">
                                    <div>
                                       <div className="flex justify-between text-xs font-bold mb-1">
                                          <span>Performance</span>
                                          <span className={gtReport.performanceScore > 80 ? 'text-green-600' : 'text-yellow-600'}>{gtReport.performanceScore}%</span>
                                       </div>
                                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${gtReport.performanceScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${gtReport.performanceScore}%` }}></div>
                                       </div>
                                    </div>
                                    <div>
                                       <div className="flex justify-between text-xs font-bold mb-1">
                                          <span>Structure</span>
                                          <span className={gtReport.structureScore > 80 ? 'text-green-600' : 'text-yellow-600'}>{gtReport.structureScore}%</span>
                                       </div>
                                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${gtReport.structureScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${gtReport.structureScore}%` }}></div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Web Vitals Grid */}
                           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                              <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-slate-500 font-bold text-xs uppercase">Web Vitals</h3>
                                 <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">What are these?</span>
                              </div>
                              <div className="grid grid-cols-3 gap-6">
                                 <VitalCard metric={gtReport.webVitals.lcp} />
                                 <VitalCard metric={gtReport.webVitals.tbt} />
                                 <VitalCard metric={gtReport.webVitals.cls} />
                              </div>
                           </div>
                        </div>

                        {/* Speed Visualization Timeline */}
                        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                           <h3 className="text-slate-800 font-bold mb-4">Speed Visualization</h3>
                           <div className="relative pt-6 pb-2">
                             <div className="h-1 bg-slate-200 w-full rounded relative">
                               {/* Markers */}
                               <TimelineMarker label="FCP" time={gtReport.performanceMetrics?.fcp.value} percent={20} color="text-green-600" />
                               <TimelineMarker label="LCP" time={gtReport.webVitals.lcp.value} percent={35} color="text-green-600" />
                               <TimelineMarker label="Onload" time={gtReport.pageDetails.fullyLoadedTime} percent={80} color="text-blue-600" />
                               <TimelineMarker label="TTI" time={gtReport.performanceMetrics?.tti.value} percent={50} color="text-orange-600" />
                             </div>
                           </div>
                        </div>

                        {/* Page Details & Issues */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                              <h3 className="text-slate-800 font-bold mb-4">Page Details</h3>
                              <div className="space-y-4">
                                 <DetailRow label="Fully Loaded Time" value={gtReport.pageDetails.fullyLoadedTime} icon={<Clock size={14}/>} />
                                 <DetailRow label="Total Page Size" value={gtReport.pageDetails.totalPageSize} icon={<Server size={14}/>} />
                                 <DetailRow label="Total Requests" value={gtReport.pageDetails.requests} icon={<Activity size={14}/>} />
                              </div>
                           </div>

                           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                              <h3 className="text-slate-800 font-bold mb-4">Top Performance Issues</h3>
                              <div className="space-y-2">
                                 {gtReport.topIssues.map((issue, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                       <div className="flex items-center gap-3">
                                          <div className={`w-3 h-3 rounded-full ${issue.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                          <span className="text-sm font-medium text-slate-700">{issue.audit}</span>
                                       </div>
                                       <span className="text-xs font-mono font-bold text-slate-500">{issue.impact}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* SUB-TAB: PERFORMANCE (NEW) */}
                   {activeSubTab === 'performance' && (
                     <div className="animate-fadeIn space-y-8">
                        <div>
                          <h3 className="font-bold text-slate-800 mb-4">Performance Metrics</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                             {gtReport.performanceMetrics && (
                               <>
                                <VitalCard metric={gtReport.performanceMetrics.fcp} />
                                <VitalCard metric={gtReport.performanceMetrics.si} />
                                <VitalCard metric={gtReport.webVitals.lcp} />
                                <VitalCard metric={gtReport.performanceMetrics.tti} />
                                <VitalCard metric={gtReport.webVitals.tbt} />
                                <VitalCard metric={gtReport.webVitals.cls} />
                               </>
                             )}
                          </div>
                        </div>

                        <div>
                           <h3 className="font-bold text-slate-800 mb-4">Browser Timings</h3>
                           <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                                 <TimingBox label="Redirect" time={`${gtReport.browserTimings?.redirect}ms`} color="bg-slate-200" />
                                 <TimingBox label="Connect" time={`${gtReport.browserTimings?.connect}ms`} color="bg-green-100" />
                                 <TimingBox label="Backend" time={`${gtReport.browserTimings?.backend}ms`} color="bg-purple-100" />
                                 <TimingBox label="TTFB" time={`${gtReport.browserTimings?.ttfb}ms`} color="bg-orange-100" />
                                 <TimingBox label="DOM Intl" time={`${gtReport.browserTimings?.domInteractive}ms`} color="bg-yellow-100" />
                                 <TimingBox label="DOM Loaded" time={`${gtReport.browserTimings?.domLoaded}ms`} color="bg-blue-100" />
                                 <TimingBox label="Onload" time={`${gtReport.browserTimings?.onload}ms`} color="bg-indigo-100" />
                              </div>
                              <div className="mt-4 h-4 flex rounded-full overflow-hidden w-full">
                                 <div className="bg-slate-300" style={{ width: '5%' }}></div>
                                 <div className="bg-green-300" style={{ width: '10%' }}></div>
                                 <div className="bg-purple-300" style={{ width: '15%' }}></div>
                                 <div className="bg-orange-300" style={{ width: '20%' }}></div>
                                 <div className="bg-yellow-300" style={{ width: '25%' }}></div>
                                 <div className="bg-blue-300" style={{ width: '10%' }}></div>
                                 <div className="bg-indigo-300" style={{ width: '15%' }}></div>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* SUB-TAB: STRUCTURE */}
                   {activeSubTab === 'structure' && (
                     <div className="animate-fadeIn">
                        <h3 className="font-bold text-slate-800 mb-4">Structure Audits</h3>
                        <div className="space-y-3">
                           {gtReport.structureAudits?.map((audit, i) => (
                              <div key={i} className={`p-4 rounded-lg border flex items-start justify-between ${
                                 audit.severity === 'High' ? 'bg-red-50 border-red-200' : 
                                 audit.severity === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'
                              }`}>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <div className={`w-3 h-3 rounded-full ${
                                          audit.severity === 'High' ? 'bg-red-500' : 
                                          audit.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                       }`}></div>
                                       <span className="font-bold text-slate-800">{audit.audit}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 pl-5">{audit.description}</p>
                                 </div>
                                 <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                    audit.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                    audit.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
                                 }`}>{audit.severity}</span>
                              </div>
                           ))}
                           {(!gtReport.structureAudits || gtReport.structureAudits.length === 0) && (
                              <div className="text-center p-8 text-slate-500">No structure audits available.</div>
                           )}
                        </div>
                     </div>
                   )}

                   {/* SUB-TAB: WATERFALL */}
                   {activeSubTab === 'waterfall' && (
                     <div className="animate-fadeIn">
                       <h3 className="font-bold text-slate-800 mb-4">Waterfall Chart</h3>
                       <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <div className="min-w-[800px] bg-white text-xs">
                             {/* Header */}
                             <div className="flex border-b border-slate-200 bg-slate-50 font-bold text-slate-500 py-2">
                                <div className="w-1/4 px-4">Filename</div>
                                <div className="w-16 px-2 text-center">Status</div>
                                <div className="w-16 px-2 text-center">Type</div>
                                <div className="w-16 px-2 text-center">Size</div>
                                <div className="w-16 px-2 text-center">Time</div>
                                <div className="flex-grow px-4">Timeline</div>
                             </div>
                             {/* Rows */}
                             {gtReport.waterfall?.map((req: WaterfallRequest, i: number) => {
                                const totalTime = req.duration; // total width
                                const maxTime = 1000; // Assume 1s max for bar scale visualization
                                const widthPercent = Math.min((totalTime / maxTime) * 100, 100);
                                const leftPercent = Math.min((req.startTime / maxTime) * 100, 95);

                                return (
                                  <div key={i} className="flex border-b border-slate-100 hover:bg-blue-50/50 py-1.5 items-center">
                                     <div className="w-1/4 px-4 truncate font-mono text-slate-700" title={req.url}>{req.url}</div>
                                     <div className={`w-16 px-2 text-center font-bold ${req.status >= 400 ? 'text-red-500' : 'text-green-600'}`}>{req.status}</div>
                                     <div className="w-16 px-2 text-center uppercase text-[10px] text-slate-500 bg-slate-100 rounded px-1">{req.type}</div>
                                     <div className="w-16 px-2 text-center text-slate-500">{req.size}</div>
                                     <div className="w-16 px-2 text-center text-slate-600 font-bold">{req.duration}ms</div>
                                     <div className="flex-grow px-4 relative h-4">
                                        <div className="h-3 rounded-sm flex overflow-hidden absolute top-0.5" style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, minWidth: '4px' }}>
                                           <div className="bg-slate-300" style={{ width: `${(req.segments.dns/totalTime)*100}%` }} title="DNS"></div>
                                           <div className="bg-green-400" style={{ width: `${(req.segments.connect/totalTime)*100}%` }} title="Connect"></div>
                                           <div className="bg-purple-400" style={{ width: `${(req.segments.ssl/totalTime)*100}%` }} title="SSL"></div>
                                           <div className="bg-orange-400" style={{ width: `${(req.segments.wait/totalTime)*100}%` }} title="Wait (TTFB)"></div>
                                           <div className="bg-blue-400" style={{ width: `${(req.segments.receive/totalTime)*100}%` }} title="Receive"></div>
                                        </div>
                                     </div>
                                  </div>
                                );
                             })}
                          </div>
                          <div className="p-3 bg-slate-50 text-xs text-slate-500 flex gap-4 border-t border-slate-200">
                             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-300"></div> DNS</span>
                             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400"></div> Connect</span>
                             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-400"></div> SSL</span>
                             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400"></div> Wait</span>
                             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400"></div> Receive</span>
                          </div>
                       </div>
                     </div>
                   )}

                   {/* SUB-TAB: VIDEO */}
                   {activeSubTab === 'video' && (
                      <div className="animate-fadeIn">
                         <h3 className="font-bold text-slate-800 mb-4">Filmstrip View</h3>
                         <div className="flex gap-4 overflow-x-auto pb-4">
                            {gtReport.filmstrip?.map((time, i) => (
                               <div key={i} className="flex-shrink-0 flex flex-col items-center">
                                  <div className="w-32 h-24 bg-slate-100 border border-slate-300 rounded shadow-sm flex items-center justify-center mb-2">
                                     <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-white"></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">{time}</span>
                               </div>
                            ))}
                         </div>
                         <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                            <Video className="mx-auto text-slate-400 mb-2" size={32} />
                            <p className="text-slate-500 text-sm">Video playback generated from filmstrip frames.</p>
                            <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 text-sm">Play Video</button>
                         </div>
                      </div>
                   )}

                   {/* SUB-TAB: HISTORY */}
                   {activeSubTab === 'history' && (
                      <div className="animate-fadeIn h-[400px] flex flex-col">
                         <h3 className="font-bold text-slate-800 mb-4">Performance History</h3>
                         <div className="flex-grow min-h-0">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={gtReport.history || []}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                 <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                 <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} domain={[0, 100]} />
                                 <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} />
                                 <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                 <Line yAxisId="left" type="monotone" dataKey="performanceScore" stroke="#3b82f6" strokeWidth={3} name="Score" />
                                 <Line yAxisId="right" type="monotone" dataKey="lcp" stroke="#ef4444" strokeWidth={3} name="LCP (s)" />
                              </LineChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                   )}

                </div>
             </div>
           )}
        </div>
      )}

      {/* --- LOAD TESTER MODE --- */}
      {activeMode === 'load' && (
        <div className="animate-fadeIn space-y-6">
           {/* Input Bar with URL and Start Button */}
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex gap-4">
              <input 
                className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Enter URL to load test (e.g., https://my-app.com/api/v1/users)..."
              />
              <button 
                onClick={startLoadTest}
                disabled={isRunning}
                className={`px-8 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg ${isRunning ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'}`}
              >
                {isRunning ? <StopCircle className="animate-pulse" /> : <Play fill="currentColor" />}
                {isRunning ? 'Stop Test' : 'Start Load Test'}
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
             {/* Configuration */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 col-span-1 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-700">Configuration</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">k6 Simulator</span>
                </div>
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Virtual Users (VUs)</label>
                <input type="range" min="100" max="5000" step="100" value={vus} onChange={e => setVus(Number(e.target.value))} className="w-full mb-2 cursor-pointer accent-yellow-500"/>
                <div className="text-right font-mono text-yellow-600 font-bold mb-6">{vus} Users</div>
                
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500">
                   <div className="flex justify-between mb-1"><span>Ramp Up:</span> <span className="font-bold">30s</span></div>
                   <div className="flex justify-between mb-1"><span>Duration:</span> <span className="font-bold">1m</span></div>
                   <div className="flex justify-between"><span>Region:</span> <span className="font-bold">US East (N. Virginia)</span></div>
                </div>
             </div>

             {/* Chart */}
             <div className="bg-white border border-slate-200 rounded-xl p-6 col-span-3 shadow-sm flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Real-Time Throughput (RPS) vs Latency</h3>
                <div className="flex-grow min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                      <defs>
                         <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{backgroundColor: 'white', borderColor: '#e2e8f0', borderRadius: '8px'}} />
                      <Area type="monotone" dataKey="rps" stroke="#eab308" fill="url(#colorRps)" strokeWidth={2} name="Req/Sec" />
                      <Area type="monotone" dataKey="latency" stroke="#3b82f6" fill="none" strokeWidth={2} name="Latency (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
             
             {metrics.length > 0 && (
               <div className="col-span-4 grid grid-cols-4 gap-4">
                   <MetricCard label="Peak RPS" value={Math.max(...metrics.map(m => m.rps))} icon={<Zap size={16}/>} />
                   <MetricCard label="Avg Latency" value={Math.round(metrics.reduce((a,b) => a+b.latency,0)/metrics.length) + 'ms'} icon={<Clock size={16}/>} />
                   <MetricCard label="Max VUs" value={Math.max(...metrics.map(m => m.virtualUsers))} icon={<Users size={16}/>} />
                   <MetricCard label="Error Rate" value={(Math.max(...metrics.map(m => m.errorRate)) * 100).toFixed(1) + '%'} icon={<Activity size={16}/>} />
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const VitalCard = ({ metric }: { metric: { name: string, value: string, score: number, rating: string } }) => (
  <div className="flex flex-col border border-slate-100 p-4 rounded-lg bg-slate-50/50">
     <span className="text-xs font-bold text-slate-500 uppercase mb-2">{metric.name}</span>
     <span className="text-2xl font-bold text-slate-800">{metric.value}</span>
     <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${metric.rating === 'Good' ? 'text-green-600' : metric.rating === 'Needs Improvement' ? 'text-yellow-600' : 'text-red-600'}`}>
        <div className={`w-2 h-2 rounded-full ${metric.rating === 'Good' ? 'bg-green-500' : metric.rating === 'Needs Improvement' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
        {metric.rating}
     </div>
  </div>
);

const TimelineMarker = ({ label, time, percent, color }: any) => (
  <div className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${percent}%` }}>
     <div className={`w-px h-6 bg-slate-400 mb-1`}></div>
     <div className={`text-xs font-bold ${color}`}>{label}</div>
     <div className="text-[10px] text-slate-500">{time}</div>
  </div>
);

const TimingBox = ({ label, time, color }: any) => (
  <div className={`rounded p-2 border border-slate-200 ${color}`}>
     <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">{label}</div>
     <div className="font-mono text-sm font-bold text-slate-800">{time}</div>
  </div>
);

const DetailRow = ({ label, value, icon }: any) => (
  <div className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
     <div className="flex items-center gap-2 text-slate-500 text-sm">
        {icon} <span>{label}</span>
     </div>
     <span className="font-bold text-slate-800">{value}</span>
  </div>
);

const MetricCard = ({ label, value, icon }: any) => (
  <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
     <div className="p-2 bg-slate-50 rounded-lg text-slate-500">{icon}</div>
     <div>
        <div className="text-xs text-slate-400 font-bold uppercase">{label}</div>
        <div className="text-xl font-bold text-slate-800">{value}</div>
     </div>
  </div>
);

const ReportTab = ({ label, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
  >
    {icon} {label}
  </button>
);

export default PerformanceLab;
