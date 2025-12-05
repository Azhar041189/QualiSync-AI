
import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, Play, FileCode, CheckCircle } from 'lucide-react';
import { runSecurityAudit } from '../services/geminiService';
import { SecurityVulnerability } from '../types';

const SecurityLab: React.FC = () => {
  const [target, setTarget] = useState("https://www.example.com");
  const [results, setResults] = useState<SecurityVulnerability[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = async () => {
    setIsScanning(true);
    setResults([]);
    try {
      const vulns = await runSecurityAudit(target);
      setResults(vulns);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Shield className="text-red-600" /> Security Lab
        </h1>
        <p className="text-slate-500">Automated Penetration Testing & Vulnerability Scanning (OWASP Top 10).</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm flex gap-4">
        <div className="flex-grow relative">
          <input 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Target URL"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <button 
          onClick={startScan} 
          disabled={isScanning}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
        >
          {isScanning ? <AlertTriangle className="animate-spin" /> : <Play />} 
          {isScanning ? 'Injecting Payloads...' : 'Start Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.map((vuln) => (
          <div key={vuln.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {vuln.name}
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 uppercase">{vuln.severity}</span>
                </h3>
                <p className="text-slate-500 text-sm mt-1">{vuln.description}</p>
              </div>
              <div className="text-xs font-mono text-slate-400">{vuln.id}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                <FileCode size={14} /> Remediation Strategy
              </div>
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{vuln.remediationCode}</pre>
            </div>
          </div>
        ))}
        {!isScanning && results.length === 0 && (
          <div className="text-center py-20 text-slate-400 opacity-60">
             <Shield size={64} className="mx-auto mb-4" />
             <p>Ready to scan. No vulnerabilities detected yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityLab;
