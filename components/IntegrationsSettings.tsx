import React, { useState } from 'react';
import { Settings, Check, ExternalLink, RefreshCw, X } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: string; // Emoji or URL
  description: string;
  connected: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

const IntegrationsSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'jira',
      name: 'Atlassian Jira',
      icon: '🔷',
      description: 'Sync User Stories for The Analyst agent to parse.',
      connected: true,
      status: 'active',
      lastSync: '10 mins ago'
    },
    {
      id: 'github',
      name: 'GitHub / GitLab',
      icon: '🐙',
      description: 'Auto-create PRs from generated Playwright scripts.',
      connected: false,
      status: 'inactive'
    },
    {
      id: 'slack',
      name: 'Slack / Teams',
      icon: '📢',
      description: 'Send alerts when The Healer fixes a broken test.',
      connected: false,
      status: 'inactive'
    },
    {
      id: 'saucelabs',
      name: 'SauceLabs / BrowserStack',
      icon: '⚡',
      description: 'Execute generated tests on real device cloud.',
      connected: true,
      status: 'active',
      lastSync: '2 hours ago'
    }
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          connected: !item.connected,
          status: !item.connected ? 'active' : 'inactive',
          lastSync: !item.connected ? 'Just now' : undefined
        };
      }
      return item;
    }));
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Settings className="text-blue-600" /> Integrations Hub
        </h1>
        <p className="text-slate-500">Manage neural bridges to external DevOps and Project Management tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className={`p-6 rounded-xl border transition-all duration-300 shadow-sm ${
            item.connected 
              ? 'bg-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${item.connected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      {item.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleConnection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  item.connected 
                    ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            
            <p className="text-slate-500 text-sm mb-6 h-10">{item.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400">
                {item.lastSync && <span>Last Sync: {item.lastSync}</span>}
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" title="Refresh">
                  <RefreshCw size={14} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" title="Settings">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsSettings;