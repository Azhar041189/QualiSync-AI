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
  position: string; 
}> = ({ role, status, isActive, icon, position }) => {
  
  // Defensive check
  if (!role) return null;

  let borderColor = "border-slate-200";
  let bgColor = "bg-white";
  let textColor = "text-slate-400";
  let glow = "";
  let scale = "scale-100";
  let zIndex = "z-10";
  let opacity = "opacity-100";
  let iconColor = "text-slate-400";

  const isOptional = [AgentRole.SECURITY, AgentRole.PERFORMANCE, AgentRole.ACCESSIBILITY].includes(role);
  
  if (status === AgentStatus.IDLE && isOptional) {
      opacity = "opacity-50 grayscale";
  }

  if (isActive) {
    borderColor = "border-blue-500";
    textColor = "text-blue-600";
    iconColor = "text-blue-600";
    glow = "shadow-[0_0_25px_rgba(59,130,246,0.4)] ring-4 ring-blue-50";
    bgColor = "bg-white";
    scale = "scale-110";
    zIndex = "z-20";
    opacity = "opacity-100 grayscale-0";
  } else if (status === AgentStatus.SUCCESS) {
    borderColor = "border-green-500";
    textColor = "text-green-600";
    iconColor = "text-green-600";
    bgColor = "bg-green-50/50";
    opacity = "opacity-100 grayscale-0";
  } else if (status === AgentStatus.ERROR || status === AgentStatus.REJECTED) {
    borderColor = "border-red-500";
    textColor = "text-red-600";
    iconColor = "text-red-600";
    bgColor = "bg-red-50/50";
    glow = "shadow-[0_0_20px_rgba(239,68,68,0.2)]";
    opacity = "opacity-100 grayscale-0";
  } else if (status === AgentStatus.THINKING) {
    borderColor = "border-amber-400";
    bgColor = "bg-amber-50";
    textColor = "text-amber-600";
    glow = "shadow-[0_0_15px_rgba(251,191,36,0.4)]";
  }

  // Safe string manipulation
  const displayName = role.replace('The ', '').replace('Auditor', '').replace('Engineer', '').replace('Coach', '');

  return (
    <div className={`absolute ${position} transition-all duration-500 flex flex-col items-center justify-center w-24 h-24 ${zIndex} ${scale} ${opacity}`}>
      {isActive && <div className="absolute inset-0 rounded-full border border-blue-400 animate-pulse-ring"></div>}
      
      <div className={`w-14 h-14 rounded-2xl border-2 ${borderColor} ${bgColor} ${glow} flex items-center justify-center relative transition-all duration-300 shadow-sm z-10`}>
        <span className={`text-2xl ${iconColor}`}>{icon}</span>
        {status === AgentStatus.THINKING && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></span>
        )}
        {status === AgentStatus.SUCCESS && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">✓</span>
        )}
      </div>
      
      <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${textColor} bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-slate-100 shadow-sm whitespace-nowrap transition-colors`}>
        {displayName}
      </div>
    </div>
  );
};

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ activeRole, statuses }) => {
  
  const getLineStyle = (isActiveFlow: boolean, isError: boolean = false) => ({
      stroke: isError ? '#ef4444' : isActiveFlow ? '#3b82f6' : '#e2e8f0',
      strokeWidth: isActiveFlow ? 3 : 2,
      strokeDasharray: '6,6',
      className: isActiveFlow || isError ? (isError ? 'animate-flow-fast' : 'animate-flow') : '',
      opacity: isActiveFlow ? 1 : 0.4
  });

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden shadow-inner backdrop-blur-sm">
      <style>{`
        @keyframes flow { to { stroke-dashoffset: -24; } }
        @keyframes flow-fast { to { stroke-dashoffset: -24; } }
        .animate-flow { animation: flow 1s linear infinite; }
        .animate-flow-fast { animation: flow-fast 0.5s linear infinite; }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(226,232,240,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(226,232,240,0.4)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" /></marker>
          <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker>
          <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#ef4444" /></marker>
        </defs>
        
        {/* Core Loop */}
        <line x1="50%" y1="15%" x2="85%" y2="30%" {...getLineStyle(activeRole === AgentRole.ARCHITECT)} markerEnd={activeRole === AgentRole.ARCHITECT ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
        <line x1="85%" y1="30%" x2="70%" y2="65%" {...getLineStyle(activeRole === AgentRole.CODER && statuses[AgentRole.CRITIC] === AgentStatus.IDLE)} markerEnd={activeRole === AgentRole.CODER ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
        <line x1="70%" y1="65%" x2="30%" y2="30%" {...getLineStyle(activeRole === AgentRole.CRITIC)} markerEnd={activeRole === AgentRole.CRITIC ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
        
        {/* Marketplace Lines */}
        {statuses[AgentRole.SECURITY] !== AgentStatus.IDLE && (
           <line x1="70%" y1="65%" x2="85%" y2="85%" {...getLineStyle(activeRole === AgentRole.SECURITY)} markerEnd="url(#arrowhead-blue)" />
        )}
        {statuses[AgentRole.PERFORMANCE] !== AgentStatus.IDLE && (
           <line x1="70%" y1="65%" x2="50%" y2="85%" {...getLineStyle(activeRole === AgentRole.PERFORMANCE)} markerEnd="url(#arrowhead-blue)" />
        )}
        {statuses[AgentRole.ACCESSIBILITY] !== AgentStatus.IDLE && (
           <line x1="70%" y1="65%" x2="15%" y2="85%" {...getLineStyle(activeRole === AgentRole.ACCESSIBILITY)} markerEnd="url(#arrowhead-blue)" />
        )}
      </svg>

      {/* Core Agents */}
      <AgentNode role={AgentRole.ANALYST} status={statuses[AgentRole.ANALYST]} isActive={activeRole === AgentRole.ANALYST} icon="🧐" position="top-[8%] left-[50%] -translate-x-1/2" />
      <AgentNode role={AgentRole.ARCHITECT} status={statuses[AgentRole.ARCHITECT]} isActive={activeRole === AgentRole.ARCHITECT} icon="🏗️" position="top-[25%] right-[5%]" />
      <AgentNode role={AgentRole.CODER} status={statuses[AgentRole.CODER]} isActive={activeRole === AgentRole.CODER} icon="👨‍💻" position="bottom-[30%] right-[20%]" />
      <AgentNode role={AgentRole.CRITIC} status={statuses[AgentRole.CRITIC]} isActive={activeRole === AgentRole.CRITIC} icon="⚖️" position="top-[25%] left-[5%]" />
      <AgentNode role={AgentRole.HEALER} status={statuses[AgentRole.HEALER]} isActive={activeRole === AgentRole.HEALER} icon="🚑" position="bottom-[30%] left-[20%]" />

      {/* Marketplace Agents (Bottom Row) */}
      <AgentNode role={AgentRole.ACCESSIBILITY} status={statuses[AgentRole.ACCESSIBILITY]} isActive={activeRole === AgentRole.ACCESSIBILITY} icon="👁️" position="bottom-[5%] left-[10%]" />
      <AgentNode role={AgentRole.PERFORMANCE} status={statuses[AgentRole.PERFORMANCE]} isActive={activeRole === AgentRole.PERFORMANCE} icon="⚡" position="bottom-[5%] left-[50%] -translate-x-1/2" />
      <AgentNode role={AgentRole.SECURITY} status={statuses[AgentRole.SECURITY]} isActive={activeRole === AgentRole.SECURITY} icon="🛡️" position="bottom-[5%] right-[10%]" />

    </div>
  );
};

export default AgentVisualizer;