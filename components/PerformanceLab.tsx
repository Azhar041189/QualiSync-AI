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
           <button onClick={() => setActiveMode('lighthouse')} className={`px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${activeMode === 'lighthouse' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}><Gauge size={16}/> GTmetrix</button>
           <button onClick={() => setActiveMode('load')} className={`px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ${activeMode === 'load' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}><Server size={16}/> Load Test</button>
        </div>
      </div>

      {activeMode === 'lighthouse' && (
        <div className="animate-fadeIn space-y-6">
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex gap-4">
             <input className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="URL..." />
             <button onClick={startAnalysis} disabled={isAnalyzing} className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50">Analyze</button>
           </div>
           {/* ... GTMetrix Report Render ... */}
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