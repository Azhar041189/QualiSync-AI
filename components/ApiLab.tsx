
import React, { useState } from 'react';
import { Server, Play, FileJson, CheckCircle, XCircle, Code, Activity, Terminal, Zap, BarChart, PieChart as PieChartIcon, RefreshCw, Layers } from 'lucide-react';
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
      console.error(e);
      alert("Failed to generate API tests. Please check your OpenAPI/Swagger format and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoHeal = async () => {
     if (!result || !result.contractTestCode) return;
     setIsHealing(true);
     try {
       const errorContext = "AssertionError: Expected 200 OK but got 401 Unauthorized. Token verification failed in test_get_users.";
       const healed = await healCode(result.contractTestCode, errorContext, 'api');
       
       setResult(prev => prev ? { ...prev, contractTestCode: healed } : null);
       setActiveTab('code');
       alert("Healer Agent has patched the test script!");
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
     return [
       { name: 'Passed', value: passed, color: '#22c55e' }, // green-500
       { name: 'Failed', value: failed, color: '#ef4444' }  // red-500
     ];
  };

  const getMethodDistribution = () => {
     if (!result?.api) return [];
     const counts: Record<string, number> = {};
     result.api.forEach(ep => {
       counts[ep.method] = (counts[ep.method] || 0) + 1;
     });
     const colors: Record<string, string> = {
       GET: '#3b82f6',   // blue-500
       POST: '#22c55e',  // green-500
       PUT: '#eab308',   // yellow-500
       DELETE: '#ef4444',// red-500
       PATCH: '#a855f7'  // purple-500
     };
     return Object.entries(counts).map(([name, value]) => ({
       name, value, color: colors[name] || '#64748b'
     }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2 rounded shadow-lg text-xs">
          <p className="font-bold text-slate-800">{label || payload[0].name}</p>
          <p style={{ color: payload[0].fill }}>
             {payload[0].value} {payload[0].unit || ''}
          </p>
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
        
        {/* LEFT: Input */}
        <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-6 h-full shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-slate-800 flex items-center gap-2">
               <FileJson size={18} className="text-yellow-500" /> API Specification
             </h2>
             <span className="text-xs text-slate-500 uppercase font-bold tracking-wider bg-slate-100 px-2 py-1 rounded">YAML / JSON</span>
          </div>
          <div className="flex-grow relative">
            <textarea 
              className="w-full h-full bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-inner"
              value={inputSpec}
              onChange={(e) => setInputSpec(e.target.value)}
              placeholder="Paste your OpenAPI/Swagger spec here..."
            />
          </div>
          <button 
            onClick={handleRun}
            disabled={isProcessing}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {isProcessing ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
            {isProcessing ? 'Analyzing Schema & Generating Tests...' : 'Generate Contract Tests'}
          </button>
        </div>

        {/* RIGHT: Output */}
        <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-6 h-full relative overflow-hidden shadow-sm">
          
          {/* Tabs */}
          <div className="flex justify-between border-b border-slate-200 mb-4">
             <div className="flex gap-2">
               <button 
                 onClick={() => setActiveTab('code')}
                 className={`px-4 py-2 text-sm font-bold transition-all rounded-t-lg flex items-center gap-2 ${
                   activeTab === 'code' 
                     ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                 }`}
               >
                 <Code size={14} /> Generated Script
               </button>
               <button 
                 onClick={() => setActiveTab('results')}
                 className={`px-4 py-2 text-sm font-bold transition-all rounded-t-lg flex items-center gap-2 ${
                   activeTab === 'results' 
                     ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                 }`}
               >
                 <Terminal size={14} /> Execution Results
               </button>
             </div>
             {result && (
                <button 
                  onClick={handleAutoHeal}
                  disabled={isHealing}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-purple-200 transition-colors shadow-sm"
                >
                  {isHealing ? <RefreshCw className="animate-spin" size={12}/> : <Zap size={12} fill="currentColor" />}
                  {isHealing ? 'Healing...' : 'Auto-Heal Tests'}
                </button>
             )}
          </div>

          <div className="flex-grow overflow-hidden relative">
             {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 gap-4 animate-fadeIn">
                   <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin shadow-lg"></div>
                   <p className="font-bold text-slate-700 animate-pulse">Building Pytest Scenarios...</p>
                   <div className="flex gap-2 text-xs text-slate-400">
                      <span className="px-2 py-1 bg-slate-100 rounded">Auth</span>
                      <span className="px-2 py-1 bg-slate-100 rounded">Rate Limits</span>
                      <span className="px-2 py-1 bg-slate-100 rounded">Schema</span>
                   </div>
                </div>
             ) : !result ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 m-2">
                   <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Server size={32} className="text-blue-400" />
                   </div>
                   <p className="font-medium">Waiting for API Specification...</p>
                </div>
             ) : (
                <div className="h-full overflow-y-auto animate-fadeIn pr-2">
                   
                   {/* CODE VIEW */}
                   {activeTab === 'code' && (
                      <div className="h-full flex flex-col rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                         <div className="bg-slate-100 border-b border-slate-200 p-2 text-xs text-slate-500 flex justify-between items-center font-mono">
                            <span className="flex items-center gap-2"><FileJson size={12}/> python/test_contract.py</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">Pytest</span>
                         </div>
                         <pre className="flex-grow text-xs font-mono text-slate-800 bg-slate-50 p-4 whitespace-pre-wrap overflow-auto selection:bg-blue-200">
                           {result.contractTestCode || "# No code generated."}
                         </pre>
                      </div>
                   )}

                   {/* RESULTS VIEW */}
                   {activeTab === 'results' && (
                      <div className="space-y-6">
                         
                         {/* Stats Cards */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm hover:border-blue-300 transition-colors">
                               <div className="text-slate-500 text-xs font-bold uppercase mb-1">Endpoints Tested</div>
                               <div className="text-3xl font-bold text-slate-800">{result.api?.length || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm hover:border-green-300 transition-colors">
                               <div className="text-slate-500 text-xs font-bold uppercase mb-1">Pass Rate</div>
                               <div className="text-3xl font-bold text-green-600">
                                 {Math.round((result.api?.filter(e => e.passed).length || 0) / (result.api?.length || 1) * 100)}%
                               </div>
                            </div>
                         </div>
                         
                         {/* Charts Grid */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Chart 1: Latency */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 h-48 flex flex-col">
                                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase flex items-center gap-1"><BarChart size={12}/> Latency (ms)</div>
                                <div className="flex-1 min-h-0 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsBarChart data={result.api || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="endpoint" hide />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="latency" name="Latency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                      </RechartsBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2: Method Distribution */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 h-48 flex flex-col">
                                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase flex items-center gap-1"><Layers size={12}/> Method Types</div>
                                <div className="flex-1 min-h-0 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie 
                                          data={getMethodDistribution()} 
                                          dataKey="value" 
                                          nameKey="name" 
                                          cx="50%" 
                                          cy="50%" 
                                          innerRadius={25}
                                          outerRadius={45}
                                          stroke="#f8fafc"
                                          strokeWidth={2}
                                        >
                                          {getMethodDistribution().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                          ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}} />
                                      </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 3: Pass/Fail */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 h-48 flex flex-col">
                                <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase flex items-center gap-1"><PieChartIcon size={12}/> Pass/Fail</div>
                                <div className="flex-1 min-h-0 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie 
                                          data={getPassFailData()} 
                                          dataKey="value" 
                                          nameKey="name" 
                                          cx="50%" 
                                          cy="50%" 
                                          innerRadius={0}
                                          outerRadius={45} 
                                          stroke="#f8fafc"
                                          strokeWidth={2}
                                        >
                                          {getPassFailData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                          ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}} />
                                      </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                         </div>

                         {/* Results Table */}
                         <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                               <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
                                  <tr>
                                     <th className="p-3">Method</th>
                                     <th className="p-3">Route</th>
                                     <th className="p-3">Latency</th>
                                     <th className="p-3">Status</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 bg-white">
                                  {result.api?.map((ep, i) => (
                                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3">
                                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                              ep.method === 'GET' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                              ep.method === 'POST' ? 'bg-green-50 border-green-200 text-green-700' :
                                              ep.method === 'DELETE' ? 'bg-red-50 border-red-200 text-red-700' :
                                              'bg-yellow-50 border-yellow-200 text-yellow-700'
                                           }`}>{ep.method}</span>
                                        </td>
                                        <td className="p-3 font-mono text-xs text-slate-700 font-medium">{ep.endpoint}</td>
                                        <td className="p-3 text-slate-500 font-mono text-xs">{ep.latency}ms</td>
                                        <td className="p-3">
                                           {ep.passed ? (
                                              <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full w-fit"><CheckCircle size={12}/> PASS</span>
                                           ) : (
                                              <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit"><XCircle size={12}/> FAIL</span>
                                           )}
                                        </td>
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
