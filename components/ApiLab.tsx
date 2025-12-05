
import React, { useState } from 'react';
import { Server, Play, FileJson, CheckCircle, XCircle, Code, Activity, Terminal, Zap, BarChart, Layers, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { runOmniScan, healCode } from '../services/geminiService';
import { OmniScanReport } from '../types';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const ApiLab: React.FC = () => {
  const [inputSpec, setInputSpec] = useState(`openapi: 3.0.0
info:
  title: User Service API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List all users
      security:
        - bearerAuth: []
      responses:
        '200':
          description: OK
        '429':
          description: Rate Limit Exceeded
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer`);
  
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
      alert("Failed to generate API tests. Please check spec format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoHeal = async () => {
     if (!result || !result.contractTestCode) return;
     setIsHealing(true);
     try {
       const healed = await healCode(result.contractTestCode, "AssertionError: 401 Unauthorized", 'api');
       setResult(prev => prev ? { ...prev, contractTestCode: healed } : null);
       setActiveTab('code');
       alert("Healer Agent patched the test script!");
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2 rounded shadow-lg text-xs">
          <p className="font-bold text-slate-800">{label || payload[0].name}</p>
          <p style={{ color: payload[0].fill }}>{payload[0].value} {payload[0].unit || ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Server className="text-blue-600" /> API Lab
        </h1>
        <p className="text-slate-500">Paste Swagger/OpenAPI specs to generate self-validating Contract Tests.</p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
        <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-6 h-full shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-slate-800 flex items-center gap-2">
               <FileJson size={18} className="text-yellow-500" /> API Specification
             </h2>
             <span className="text-xs text-slate-500 uppercase font-bold tracking-wider bg-slate-100 px-2 py-1 rounded">YAML / JSON</span>
          </div>
          <textarea 
            className="w-full h-full bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"
            value={inputSpec}
            onChange={(e) => setInputSpec(e.target.value)}
          />
          <button onClick={handleRun} disabled={isProcessing} className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {isProcessing ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
            {isProcessing ? 'Analyzing...' : 'Generate Contract Tests'}
          </button>
        </div>

        <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-6 h-full relative overflow-hidden shadow-sm">
          <div className="flex justify-between border-b border-slate-200 mb-4">
             <div className="flex gap-2">
               <button onClick={() => setActiveTab('code')} className={`px-4 py-2 text-sm font-bold rounded-t-lg flex items-center gap-2 ${activeTab === 'code' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <Code size={14} /> Generated Script
               </button>
               <button onClick={() => setActiveTab('results')} className={`px-4 py-2 text-sm font-bold rounded-t-lg flex items-center gap-2 ${activeTab === 'results' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
                 <Terminal size={14} /> Results
               </button>
             </div>
             {result && (
                <button onClick={handleAutoHeal} disabled={isHealing} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-purple-200">
                  {isHealing ? <RefreshCw className="animate-spin" size={12}/> : <Zap size={12} fill="currentColor" />}
                  {isHealing ? 'Healing...' : 'Auto-Heal'}
                </button>
             )}
          </div>

          <div className="flex-grow overflow-hidden relative">
             {!result ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60">
                   <Server size={32} className="mb-2" />
                   <p>Waiting for Spec...</p>
                </div>
             ) : (
                <div className="h-full overflow-y-auto pr-2">
                   {activeTab === 'code' && (
                      <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded border border-slate-200 whitespace-pre-wrap">
                        {result.contractTestCode || "# No code generated."}
                      </pre>
                   )}
                   {activeTab === 'results' && (
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                               <div className="text-slate-500 text-xs font-bold uppercase">Pass Rate</div>
                               <div className="text-2xl font-bold text-green-600">
                                 {Math.round((result.api?.filter(e => e.passed).length || 0) / (result.api?.length || 1) * 100)}%
                               </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center">
                               <div className="text-slate-500 text-xs font-bold uppercase">Endpoints</div>
                               <div className="text-2xl font-bold text-blue-600">{result.api?.length || 0}</div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-40">
                             <div className="bg-slate-50 rounded border border-slate-200 p-2 flex flex-col">
                                <h4 className="text-[10px] font-bold text-slate-500 mb-1">LATENCY</h4>
                                <div className="flex-1 min-h-0"><ResponsiveContainer><RechartsBarChart data={result.api || []}><Bar dataKey="latency" fill="#3b82f6" /></RechartsBarChart></ResponsiveContainer></div>
                             </div>
                             <div className="bg-slate-50 rounded border border-slate-200 p-2 flex flex-col">
                                <h4 className="text-[10px] font-bold text-slate-500 mb-1">METHODS</h4>
                                <div className="flex-1 min-h-0"><ResponsiveContainer><PieChart><Pie data={getMethodDistribution()} dataKey="value" cx="50%" cy="50%" innerRadius={15} outerRadius={30}><Cell/></Pie><Tooltip/></PieChart></ResponsiveContainer></div>
                             </div>
                             <div className="bg-slate-50 rounded border border-slate-200 p-2 flex flex-col">
                                <h4 className="text-[10px] font-bold text-slate-500 mb-1">PASS/FAIL</h4>
                                <div className="flex-1 min-h-0"><ResponsiveContainer><PieChart><Pie data={getPassFailData()} dataKey="value" cx="50%" cy="50%" innerRadius={0} outerRadius={30}><Cell/></Pie><Tooltip/></PieChart></ResponsiveContainer></div>
                             </div>
                         </div>

                         <div className="border border-slate-200 rounded overflow-hidden">
                            <table className="w-full text-xs text-left">
                               <thead className="bg-slate-100 text-slate-600 font-bold uppercase"><tr><th className="p-2">Method</th><th className="p-2">Path</th><th className="p-2">Status</th></tr></thead>
                               <tbody>
                                  {result.api?.map((ep, i) => (
                                     <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="p-2 font-bold text-slate-700">{ep.method}</td>
                                        <td className="p-2 font-mono text-slate-600">{ep.endpoint}</td>
                                        <td className="p-2">{ep.passed ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={10}/> {ep.status}</span> : <span className="text-red-600 flex items-center gap-1"><XCircle size={10}/> {ep.status}</span>}</td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   )}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiLab;
