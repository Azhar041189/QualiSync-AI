import React from 'react';
import { CheckCircle2, Circle, Clock, Rocket, Zap, Database, Globe, Shield } from 'lucide-react';

interface Milestone {
  quarter: string;
  title: string;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'planned';
  items: string[];
}

const milestones: Milestone[] = [
  {
    quarter: "Phase 1: Genesis Core",
    title: "The Multi-Agent Foundation",
    icon: <Rocket className="text-blue-500" />,
    status: 'completed',
    items: [
      "Migrate Simulation to Python/FastAPI Backend",
      "Implement Microsoft AutoGen for Agent Orchestration",
      "Dockerized Playwright Sandbox for Safe Execution",
      "Basic 'Coder <-> Critic' Feedback Loop"
    ]
  },
  {
    quarter: "Phase 2: The Neural Bridge",
    title: "Integrations & Shift-Left",
    icon: <Zap className="text-yellow-500" />,
    status: 'completed',
    items: [
      "Jira/Linear Integration (Analyst Agent fetches tickets)",
      "GitHub Integration (Auto-PR creation)",
      "Video-to-Code: Codeless Recording Processor",
      "Slack/Teams 'Agent Handoff' Alerts"
    ]
  },
  {
    quarter: "Phase 3: The Self-Healing Grid",
    title: "Advanced Intelligence",
    icon: <Database className="text-purple-500" />,
    status: 'active',
    items: [
      "Vector Database (Pinecone) for DOM Snapshots",
      "Semantic Search for Element Healing",
      "Visual Regression Analysis (AI Vision)",
      "Performance Anomaly Detection"
    ]
  },
  {
    quarter: "Phase 4: Enterprise Scale",
    title: "Global Compliance & SaaS",
    icon: <Shield className="text-green-500" />,
    status: 'active',
    items: [
      "SSO & RBAC (Role-Based Access Control)",
      "Multi-Tenant SaaS Architecture",
      "Compliance Reporting (SOC2/ISO)",
      "Marketplace for Custom Agent Personas"
    ]
  }
];

const Roadmap: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Globe className="text-blue-600" /> Strategic Roadmap
        </h1>
        <p className="text-slate-500">Execution plan to transition QualiSync from Prototype to Enterprise Platform.</p>
      </div>

      <div className="relative border-l border-slate-200 ml-4 md:ml-8 space-y-12">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative pl-8 md:pl-12">
            {/* Timeline Connector */}
            <div className={`absolute -left-3 md:-left-4 top-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 flex items-center justify-center bg-white z-10 ${
              milestone.status === 'completed' ? 'border-green-500 text-green-500' :
              milestone.status === 'active' ? 'border-blue-500 text-blue-500 animate-pulse' :
              'border-slate-300 text-slate-400'
            }`}>
              {milestone.status === 'completed' ? <CheckCircle2 size={16} /> :
               milestone.status === 'active' ? <Clock size={16} /> :
               <Circle size={16} />}
            </div>

            {/* Content Card */}
            <div className={`p-6 rounded-xl border transition-all duration-300 shadow-sm ${
              milestone.status === 'active' 
                ? 'bg-white border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                : milestone.status === 'completed'
                ? 'bg-slate-50 border-green-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white border border-slate-200`}>
                    {milestone.icon}
                  </div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      milestone.status === 'active' ? 'text-blue-600' : 
                      milestone.status === 'completed' ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {milestone.quarter}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{milestone.title}</h3>
                  </div>
                </div>
                {milestone.status === 'active' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full border border-blue-200">
                    IN PROGRESS
                  </span>
                )}
                {milestone.status === 'completed' && (
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full border border-green-200">
                    COMPLETED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {milestone.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-500">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      milestone.status === 'completed' ? 'bg-green-500' : 'bg-slate-400'
                    }`} />
                    <span className={milestone.status === 'completed' ? 'text-slate-600' : ''}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;