import React, { useState } from 'react';
import { Database, Zap, Shield, FileJson, Copy, RefreshCw, Table } from 'lucide-react';
import { generateSyntheticData } from '../services/geminiService';

const SyntheticData: React.FC = () => {
  const [schemaInput, setSchemaInput] = useState(`{
  "username": "string",
  "email": "email",
  "age": "integer(18-99)",
  "bio": "string(max:200)"
}`);
  const [rowCount, setRowCount] = useState(5);
  const [scenario, setScenario] = useState<'Happy Path' | 'Edge Cases' | 'Security Payloads'>('Happy Path');
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedData([]);
    try {
      const jsonStr = await generateSyntheticData(schemaInput, rowCount, scenario);
      const data = JSON.parse(jsonStr);
      setGeneratedData(data);
    } catch (e) {
      console.error("Failed to parse generated data", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedData, null, 2));
    alert("JSON copied to clipboard!");
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Database className="text-blue-600" /> Synthetic Data Engine
        </h1>
        <p className="text-slate-500">Generate GDPR-compliant, edge-case, or security-focused test datasets instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full min-h-0">
        
        {/* Configuration Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> Configuration
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-500 mb-2">Data Schema (JSON-like)</label>
            <textarea 
              value={schemaInput} 
              onChange={(e) => setSchemaInput(e.target.value)}
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono text-blue-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-500 mb-2">Scenario Type</label>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setScenario('Happy Path')}
                className={`px-4 py-3 rounded-lg border text-left text-sm font-bold transition-all ${scenario === 'Happy Path' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                <span className="block text-xs uppercase opacity-70 mb-1">Standard</span>
                ✅ Happy Path (Clean Data)
              </button>
              <button 
                onClick={() => setScenario('Edge Cases')}
                className={`px-4 py-3 rounded-lg border text-left text-sm font-bold transition-all ${scenario === 'Edge Cases' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                <span className="block text-xs uppercase opacity-70 mb-1">Stress Testing</span>
                ⚠️ Edge Cases (Limits, Emojis, Nulls)
              </button>
              <button 
                onClick={() => setScenario('Security Payloads')}
                className={`px-4 py-3 rounded-lg border text-left text-sm font-bold transition-all ${scenario === 'Security Payloads' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
              >
                <span className="block text-xs uppercase opacity-70 mb-1">Penetration Testing</span>
                🛡️ Security Payloads (XSS, SQLi)
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-500 mb-2">Row Count: {rowCount}</label>
            <input 
              type="range" min="1" max="50" value={rowCount} 
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <RefreshCw className="animate-spin" /> : <Database />}
            {isGenerating ? 'Synthesizing...' : 'Generate Dataset'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col relative shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Table size={20} className="text-purple-500" /> Generated Data Preview
             </h2>
             {generatedData.length > 0 && (
               <button onClick={copyToClipboard} className="text-xs flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-slate-600 transition-colors border border-slate-200">
                 <Copy size={14} /> Copy JSON
               </button>
             )}
          </div>

          {/* Changed background from bg-slate-900 to bg-slate-50 and updated text colors */}
          <div className="flex-grow bg-slate-50 border border-slate-200 rounded-lg overflow-auto p-4 font-mono text-xs shadow-inner">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                 <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                 <p className="animate-pulse font-bold">AI is crafting unique data rows...</p>
              </div>
            ) : generatedData.length > 0 ? (
               <div className="space-y-4">
                 {generatedData.map((row, idx) => (
                   <div key={idx} className="bg-white p-3 rounded border border-slate-200 hover:border-blue-400 transition-colors shadow-sm">
                     <div className="text-slate-400 mb-1 select-none font-bold">Row #{idx + 1}</div>
                     {Object.entries(row).map(([key, value]) => (
                       <div key={key} className="grid grid-cols-12 gap-2 mb-1">
                         <span className="col-span-3 text-purple-600 font-bold text-right pr-2">{key}:</span>
                         <span className={`col-span-9 break-all ${
                            typeof value === 'string' && (value.includes('<script>') || value.includes('OR 1=1')) 
                              ? 'text-red-600 font-bold bg-red-50 px-1 rounded border border-red-100' 
                              : 'text-green-700'
                         }`}>
                           {String(value)}
                         </span>
                       </div>
                     ))}
                   </div>
                 ))}
               </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                 <FileJson size={48} className="mb-2" />
                 <p>Configure and generate data to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyntheticData;