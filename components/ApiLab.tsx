import React, { useState } from 'react';
import { Server, Play, FileJson, CheckCircle, XCircle, Code, Activity, Terminal, Zap, BarChart, Layers, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { runOmniScan, healCode } from '../services/geminiService';
import { OmniScanReport } from '../types';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const ApiLab: React.FC = () => {
  const [inputSpec, setInputSpec] = useState(`openapi: 3.0.0\ninfo:\n  title: User Service API\n...`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [result, setResult] = useState<OmniScanReport | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'code'>('code');

  const handleRun = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    try {
      const report = await runOmniScan(inputSpec, ['api']);
      setResult(report);
      setActiveTab('results');
    } catch (e) {
      alert("Failed to generate API tests.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoHeal = async () => {
     if (!result || !result.contractTestCode) return;
     setIsHealing(true);
     try {
       const healed = await healCode(result.contractTestCode, "AssertionError: 401", 'api');
       setResult(prev => prev ? { ...prev, contractTestCode: healed } : null);
       setActiveTab('code');
     } catch (e) {
       alert("Healing failed.");
     } finally {
       setIsHealing(false);
     }
  };

  const getPassFailData = () => {
     if (!result?.api) return [];
     const passed = result.api.filter(e => e.passed).length;
     const failed = result.api.length - passed;
     return [ { name: 'Passed', value: passed, color: '#22c55e' }, { name: 'Failed', value: failed, color: '#ef4444' } ];
  };

  const getMethodDistribution = () => {
     if (!result?.api) return [];
     const counts: Record<string, number> = {};
     result.api.forEach(ep => counts[ep.method] = (counts[ep.method] || 0) + 1);
     const colors: Record<string, string> = { GET: '#3b82f6', POST: '#22c55e', PUT: '#eab308', DELETE: '#ef4444', PATCH: '#a855f7' };
     return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] || '#64748b' }));
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto dark:bg-slate-900 dark:text-white">
      {/* ... Header ... */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Server className="text-blue-600"/> API Lab</h1>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        {/* Input Area */}
        <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 h-full shadow-sm">
          <textarea 
            className="w-full h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 font-mono text-xs"
            value={inputSpec}
            onChange={(e) => setInputSpec(e.target.value)}
          />
          <button onClick={handleRun} disabled={isProcessing} className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {isProcessing ? <Activity className="animate-spin" /> : <Play fill="currentColor" />} Generate Tests
          </button>
        </div>

        {/* Results Area */}
        <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 h-full overflow-hidden">
          <div className="flex justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
             <div className="flex gap-2">
               <button onClick={() => setActiveTab('code')} className={`px-4 py-2 text-sm font-bold rounded ${activeTab === 'code' ? 'bg-blue-100 text-blue-600' : 'text-slate-500'}`}>Code</button>
               <button onClick={() => setActiveTab('results')} className={`px-4 py-2 text-sm font-bold rounded ${activeTab === 'results' ? 'bg-green-100 text-green-600' : 'text-slate-500'}`}>Results</button>
             </div>
             {result && <button onClick={handleAutoHeal} disabled={isHealing} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">Auto-Heal</button>}
          </div>

          <div className="flex-grow overflow-y-auto">
             {!result ? <div className="text-center text-slate-400 mt-10">Waiting for input...</div> : (
                activeTab === 'code' ? (
                   <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded">{result.contractTestCode}</pre>
                ) : (
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-40">
                         {/* Explicitly sized containers for Recharts */}
                         <div className="bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-2 flex flex-col" style={{height: '160px'}}>
                            <h4 className="text-[10px] font-bold text-slate-500 mb-1">LATENCY</h4>
                            <div style={{ width: '100%', height: '100%', minHeight: '0' }}>
                               <ResponsiveContainer><RechartsBarChart data={result.api || []}><Bar dataKey="latency" fill="#3b82f6" /></RechartsBarChart></ResponsiveContainer>
                            </div>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-2 flex flex-col" style={{height: '160px'}}>
                            <h4 className="text-[10px] font-bold text-slate-500 mb-1">METHODS</h4>
                            <div style={{ width: '100%', height: '100%', minHeight: '0' }}>
                               <ResponsiveContainer><PieChart><Pie data={getMethodDistribution()} dataKey="value" cx="50%" cy="50%" innerRadius={15} outerRadius={30}><Cell/></Pie></PieChart></ResponsiveContainer>
                            </div>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-2 flex flex-col" style={{height: '160px'}}>
                            <h4 className="text-[10px] font-bold text-slate-500 mb-1">PASS/FAIL</h4>
                            <div style={{ width: '100%', height: '100%', minHeight: '0' }}>
                               <ResponsiveContainer><PieChart><Pie data={getPassFailData()} dataKey="value" cx="50%" cy="50%" innerRadius={0} outerRadius={30}><Cell/></Pie></PieChart></ResponsiveContainer>
                            </div>
                         </div>
                      </div>
                   </div>
                )
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiLab;