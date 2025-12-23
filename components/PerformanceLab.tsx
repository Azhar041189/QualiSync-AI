import React, { useState } from 'react';
import { Zap, Activity, Users, Clock, StopCircle, Play, Gauge, BarChart, Server, Globe, Monitor, BarChart2, Video, List, History, Layout, Timer } from 'lucide-react';
import { runPerformanceSimulation, runLighthouseSimulation } from '../services/geminiService';
import { PerformanceMetric, GTMetrixReport, WaterfallRequest } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const PerformanceLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'load' | 'lighthouse'>('lighthouse');
  // ... (State init same as before) ...
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [vus, setVus] = useState(500);
  const [targetUrl, setTargetUrl] = useState("https://heartlandroofingandsiding.com");
  const [gtReport, setGtReport] = useState<GTMetrixReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'performance' | 'structure' | 'waterfall' | 'video' | 'history'>('summary');
  const [location, setLocation] = useState("Vancouver, Canada");
  const [device, setDevice] = useState("Chrome (Desktop) 117.0");

  const startLoadTest = async () => {
    setIsRunning(true);
    setMetrics([]);
    const data = await runPerformanceSimulation({ vus, duration: '1m' });
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6 flex justify-between items-end">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Zap className="text-yellow-500" /> Performance Lab</h1>
        <div className="bg-white border border-slate-200 p-1 rounded-lg flex shadow-sm">
          <button onClick={() => setActiveMode('lighthouse')} className={`px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${activeMode === 'lighthouse' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}><Gauge size={16} /> GTmetrix</button>
          <button onClick={() => setActiveMode('load')} className={`px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${activeMode === 'load' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}><Server size={16} /> Load Test</button>
        </div>
      </div>

      {activeMode === 'lighthouse' && (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex gap-4">
            <input className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="URL..." />
            <button onClick={startAnalysis} disabled={isAnalyzing} className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50">Analyze</button>
          </div>
          {gtReport && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">GTmetrix Report</h2>
                  <div className="text-sm text-slate-500 flex gap-4 mt-1">
                    <span className="flex items-center gap-1"><Globe size={14} /> {gtReport.url}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(gtReport.timestamp).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Monitor size={14} /> {gtReport.device}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-4xl font-bold px-4 py-2 rounded-lg border-2 ${gtReport.gtmetrixGrade === 'A' ? 'text-green-600 border-green-600 bg-green-50' :
                    gtReport.gtmetrixGrade === 'B' ? 'text-blue-600 border-blue-600 bg-blue-50' :
                      'text-yellow-600 border-yellow-600 bg-yellow-50'
                    }`}>
                    Grade {gtReport.gtmetrixGrade}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ScoreCard label="Performance Score" score={gtReport.performanceScore} />
                <ScoreCard label="Structure Score" score={gtReport.structureScore} />
                <div className="grid grid-cols-3 gap-2">
                  <VitalBox label="LCP" metric={gtReport.webVitals.lcp} />
                  <VitalBox label="TBT" metric={gtReport.webVitals.tbt} />
                  <VitalBox label="CLS" metric={gtReport.webVitals.cls} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><List size={18} /> Top Issues</h3>
                  <div className="space-y-3">
                    {gtReport.topIssues.map((issue, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                        <div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${issue.priority === 'High' ? 'bg-red-100 text-red-700' :
                            issue.priority === 'Med' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-slate-600'
                            }`}>{issue.priority}</span>
                          <p className="text-sm font-medium text-slate-700 mt-1">{issue.audit}</p>
                        </div>
                        <span className="text-xs text-slate-400">{issue.impact}</span>
                      </div>
                    ))}
                    {gtReport.topIssues.length === 0 && <div className="text-slate-400 text-sm text-center py-4">No major issues found.</div>}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><History size={18} /> Waterfall Preview</h3>
                  <div className="space-y-2">
                    {gtReport.waterfall.map((req, idx) => (
                      <div key={idx} className="flex items-center text-xs gap-2">
                        <div className={`w-8 font-bold ${req.status >= 400 ? 'text-red-500' : 'text-green-500'}`}>{req.status}</div>
                        <div className="w-8 uppercase text-slate-400">{req.method}</div>
                        <div className="flex-grow truncate text-slate-600" title={req.url}>{req.url}</div>
                        <div className="w-12 text-right text-slate-400">{req.duration}ms</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {gtReport && activeSubTab === 'history' && (
            <div className="h-[400px]">
              <div style={{ width: '100%', height: '100%' }}>
                <ResponsiveContainer><LineChart data={gtReport.history || []}><Line type="monotone" dataKey="performanceScore" stroke="#3b82f6" /></LineChart></ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMode === 'load' && (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex gap-4">
            <button onClick={startLoadTest} disabled={isRunning} className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg ${isRunning ? 'bg-red-600' : 'bg-slate-900'}`}>
              {isRunning ? 'Stop Test' : 'Start Load Test'}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
            <h3 className="font-bold text-slate-700 mb-4">Real-Time Throughput</h3>
            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
              <ResponsiveContainer>
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="rps" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="latency" stroke="#3b82f6" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceLab;

const ScoreCard = ({ label, score }: { label: string, score: number }) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
    <div className={`text-3xl font-bold mb-1 ${score >= 90 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
      }`}>{score}%</div>
    <div className="text-xs font-bold text-slate-400 uppercase">{label}</div>
  </div>
);

const VitalBox = ({ label, metric }: { label: string, metric: any }) => (
  <div className="bg-white p-2 rounded border border-slate-200 text-center">
    <div className="text-xs font-bold text-slate-400">{label}</div>
    <div className={`font-bold ${metric.rating === 'Good' ? 'text-green-600' : 'text-yellow-600'}`}>{metric.value}</div>
  </div>
);