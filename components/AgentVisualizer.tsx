import React from 'react';
import { AgentRole, AgentStatus } from '../types';

interface AgentVisualizerProps {
  activeRole: AgentRole;
  statuses: Record<AgentRole, AgentStatus>;
}

const AgentNode: React.FC<{ 
  role: AgentRole; 
  status: AgentStatus; 
  isActive: boolean; 
  icon: string;
  position: string; // Tailwind class for absolute positioning
}> = ({ role, status, isActive, icon, position }) => {
  
  let borderColor = "border-slate-300";
  let bgColor = "bg-white";
  let textColor = "text-slate-500";
  let glow = "";
  let scale = "scale-100";

  if (isActive) {
    borderColor = "border-blue-500";
    textColor = "text-blue-600";
    glow = "shadow-[0_0_20px_rgba(59,130,246,0.3)]";
    bgColor = "bg-blue-50";
    scale = "scale-110";
  } else if (status === AgentStatus.SUCCESS) {
    borderColor = "border-green-500";
    textColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (status === AgentStatus.ERROR || status === AgentStatus.REJECTED) {
    borderColor = "border-red-500";
    textColor = "text-red-600";
    bgColor = "bg-red-50";
    glow = "shadow-[0_0_15px_rgba(239,68,68,0.2)]";
  }

  return (
    <div className={`absolute ${position} transition-all duration-500 flex flex-col items-center justify-center w-24 h-24 z-10 ${scale}`}>
      {isActive && <div className="absolute inset-0 rounded-full border border-blue-400 animate-pulse-ring"></div>}
      <div className={`w-16 h-16 rounded-full border-2 ${borderColor} ${bgColor} ${glow} flex items-center justify-center z-10 transition-all duration-300 shadow-sm`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`mt-2 text-xs font-bold uppercase tracking-wider ${textColor} bg-white px-2 py-0.5 rounded border border-slate-200 shadow-md`}>
        {role.replace('The ', '')}
      </div>
    </div>
  );
};

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ activeRole, statuses }) => {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      {/* Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
           <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
        </defs>
        
        {/* Workflow Path */}
        {/* Analyst -> Architect */}
        <line x1="50%" y1="23%" x2="80%" y2="38%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
        
        {/* Architect -> Coder */}
        <line x1="80%" y1="38%" x2="65%" y2="80%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
        
        {/* Coder -> Critic (Review Loop) */}
        <line x1="65%" y1="80%" x2="20%" y2="38%" stroke={activeRole === AgentRole.CRITIC || statuses[AgentRole.CRITIC] === AgentStatus.THINKING ? "#3b82f6" : "#94a3b8"} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

        {/* Critic -> Coder (Rejection Loop) */}
        {statuses[AgentRole.CRITIC] === AgentStatus.REJECTED && (
          <path d="M 20% 38% Q 42% 60% 65% 80%" stroke="#ef4444" fill="none" strokeWidth="2" markerEnd="url(#arrowhead-red)" className="animate-pulse" />
        )}

        {/* Runtime Failure -> Healer (Coder to Healer) */}
         <line x1="65%" y1="80%" x2="25%" y2="80%" stroke={activeRole === AgentRole.HEALER ? "#ef4444" : "#94a3b8"} strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />


      </svg>

      <AgentNode 
        role={AgentRole.ANALYST} 
        status={statuses[AgentRole.ANALYST]} 
        isActive={activeRole === AgentRole.ANALYST}
        icon="🧐"
        position="top-[15%] left-[50%] -translate-x-1/2" 
      />

      <AgentNode 
        role={AgentRole.ARCHITECT} 
        status={statuses[AgentRole.ARCHITECT]} 
        isActive={activeRole === AgentRole.ARCHITECT}
        icon="🏗️"
        position="top-[30%] right-[10%]" 
      />

      <AgentNode 
        role={AgentRole.CODER} 
        status={statuses[AgentRole.CODER]} 
        isActive={activeRole === AgentRole.CODER}
        icon="👨‍💻"
        position="bottom-[10%] right-[25%]" 
      />

       <AgentNode 
        role={AgentRole.HEALER} 
        status={statuses[AgentRole.HEALER]} 
        isActive={activeRole === AgentRole.HEALER}
        icon="🚑"
        position="bottom-[10%] left-[25%]" 
      />

      <AgentNode 
        role={AgentRole.CRITIC} 
        status={statuses[AgentRole.CRITIC]} 
        isActive={activeRole === AgentRole.CRITIC}
        icon="⚖️"
        position="top-[30%] left-[10%]" 
      />

      {/* Center Hub */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-slate-500 text-[10px] tracking-widest uppercase mb-1">QualiSync Core</div>
        <div className="w-32 h-32 rounded-full border border-slate-200 flex items-center justify-center animate-spin-slow bg-white/50">
           <div className="w-24 h-24 rounded-full bg-blue-100/50 blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default AgentVisualizer;