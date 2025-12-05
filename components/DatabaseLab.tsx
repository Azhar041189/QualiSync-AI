
import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { runDatabaseVerification } from '../services/geminiService';
import { DatabaseCheck } from '../types';

const DatabaseLab: React.FC = () => {
  const [checks, setChecks] = useState<DatabaseCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const runChecks = async () => {
     setLoading(true);
     const results = await runDatabaseVerification({});
     setChecks(results);
     setLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Database className="text-purple-600" /> Database Lab
        </h1>
        <p className="text-slate-500">Schema Integrity, Data Consistency, and Query Performance validation.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Connection: <span className="text-green-600">Production Read-Replica</span></h3>
            <button onClick={runChecks} disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50">
               {loading ? <RefreshCw className="animate-spin" size={16}/> : <Database size={16}/>}
               {loading ? 'Verifying Schema...' : 'Run Integrity Checks'}
            </button>
         </div>
         
         <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
               <tr>
                  <th className="p-3">Table</th>
                  <th className="p-3">Check Type</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {checks.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                     <td className="p-3 font-mono font-bold text-slate-700">{c.table}</td>
                     <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{c.checkType}</span></td>
                     <td className="p-3 text-slate-500">{c.details}</td>
                     <td className="p-3">
                        {c.status === 'Pass' ? 
                           <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={14}/> Pass</span> : 
                           <span className="flex items-center gap-1 text-red-600 font-bold"><XCircle size={14}/> Fail</span>
                        }
                     </td>
                  </tr>
               ))}
               {!loading && checks.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No checks executed yet.</td></tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default DatabaseLab;
