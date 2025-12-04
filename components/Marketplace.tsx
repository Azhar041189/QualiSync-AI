import React, { useState } from 'react';
import { ShoppingBag, Shield, Zap, Eye, Database, Download, Check } from 'lucide-react';

interface AgentProduct {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'Security' | 'Performance' | 'Accessibility' | 'Data';
  price: string;
  installed: boolean;
}

const Marketplace: React.FC = () => {
  const [agents, setAgents] = useState<AgentProduct[]>([
    {
      id: 'sec_01',
      name: 'Zero-Trust Security Auditor',
      description: 'Auto-injects SQLi and XSS payloads into input fields during test execution to verify sanitization.',
      icon: <Shield size={32} className="text-red-500" />,
      category: 'Security',
      price: '$499/mo',
      installed: false
    },
    {
      id: 'perf_01',
      name: 'Lighthouse Performance Guard',
      description: 'Runs Lighthouse CI checks on every build and fails pipeline if Core Web Vitals drop below 90.',
      icon: <Zap size={32} className="text-yellow-500" />,
      category: 'Performance',
      price: '$299/mo',
      installed: false
    },
    {
      id: 'a11y_01',
      name: 'A11y Accessibility Coach',
      description: 'Scans DOM for WCAG 2.1 violations (contrast, aria-labels) and suggests code fixes.',
      icon: <Eye size={32} className="text-blue-500" />,
      category: 'Accessibility',
      price: 'Free',
      installed: true
    },
    {
      id: 'data_01',
      name: 'Synthetic Data Fabricator',
      description: 'Generates GDPR-compliant PII mock data for test scenarios on the fly.',
      icon: <Database size={32} className="text-green-500" />,
      category: 'Data',
      price: '$199/mo',
      installed: false
    }
  ]);

  const toggleInstall = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, installed: !a.installed } : a));
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <ShoppingBag className="text-blue-600" /> Agent Marketplace
        </h1>
        <p className="text-slate-500">Extend your QA Squad with specialized Digital Workers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col h-full shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 group-hover:border-slate-300 transition-colors">
                {agent.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                agent.category === 'Security' ? 'bg-red-100 text-red-600' :
                agent.category === 'Performance' ? 'bg-yellow-100 text-yellow-600' :
                agent.category === 'Accessibility' ? 'bg-blue-100 text-blue-600' :
                'bg-green-100 text-green-600'
              }`}>
                {agent.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">{agent.name}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">{agent.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
              <span className="font-mono font-bold text-slate-700">{agent.price}</span>
              <button 
                onClick={() => toggleInstall(agent.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                  agent.installed 
                    ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                {agent.installed ? (
                  <><Check size={16} /> Installed</>
                ) : (
                  <><Download size={16} /> Install Agent</>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Coming Soon Card */}
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-70">
           <div className="w-16 h-16 rounded-full bg-white border border-slate-200 mb-4 flex items-center justify-center shadow-sm">
             <span className="text-2xl">🚀</span>
           </div>
           <h3 className="text-lg font-bold text-slate-700">Submit Your Agent</h3>
           <p className="text-sm text-slate-500 mt-2">Build custom agents using our SDK and monetize on the marketplace.</p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;