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
  let zIndex = "z-10";

  if (isActive) {
    borderColor = "border-blue-500";
    textColor = "text-blue-600";
    glow = "shadow-[0_0_20px_rgba(59,130,246,0.5)]";
    bgColor = "bg-blue-50";
    scale = "scale-110";
    zIndex = "z-20";
  } else if (status === AgentStatus.SUCCESS) {
    borderColor = "border-green-500";
    textColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (status === AgentStatus.ERROR || status === AgentStatus.REJECTED) {
    borderColor = "border-red-500";
    textColor = "text-red-600";
    bgColor = "bg-red-50";
    glow = "shadow-[0_0_15px_rgba(239,68,68,0.3)]";
  }

  return (
    <div className={`absolute ${position} transition-all duration-500 flex flex-col items-center justify-center w-24 h-24 ${zIndex} ${scale}`}>
      {isActive && <div className="absolute inset-0 rounded-full border border-blue-400 animate-pulse-ring"></div>}
      <div className={`w-16 h-16 rounded-full border-2 ${borderColor} ${bgColor} ${glow} flex items-center justify-center relative transition-all duration-300 shadow-sm`}>
        <span className="text-2xl">{icon}</span>
        {status === AgentStatus.THINKING && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
        )}
      </div>
      <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${textColor} bg-white px-2 py-0.5 rounded border border-slate-200 shadow-md whitespace-nowrap`}>
        {role.replace('The ', '')}
      </div>
    </div>
  );
};

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ activeRole, statuses }) => {
  
  // Helper to calculate line styling based on flow
  const getLineStyle = (isActiveFlow: boolean, isError: boolean = false) => {
    if (isError) {
       return {
         stroke: '#ef4444',
         strokeWidth: 2,
         strokeDasharray: '6,4',
         className: 'animate-flow-fast',
         opacity: 1
       };
    }
    if (isActiveFlow) {
      return {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '6,4',
        className: 'animate-flow',
        opacity: 1
      };
    }
    return {
      stroke: '#cbd5e1', // slate-300
      strokeWidth: 2,
      strokeDasharray: '6,4',
      className: '',
      opacity: 0.5
    };
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-inner">
      <style>{`
        @keyframes flow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes flow-fast {
          to { stroke-dashoffset: -20; }
        }
        .animate-flow {
          animation: flow 1s linear infinite;
        }
        .animate-flow-fast {
          animation: flow-fast 0.5s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
      `}</style>

      {/* Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
          </marker>
          <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
           <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
          </marker>
        </defs>
        
        {/* Analyst -> Architect */}
        <line 
          x1="50%" y1="23%" x2="80%" y2="38%" 
          {...getLineStyle(activeRole === AgentRole.ARCHITECT)}
          markerEnd={activeRole === AgentRole.ARCHITECT ? "url(#arrowhead-blue)" : "url(#arrowhead)"} 
        />
        
        {/* Architect -> Coder */}
        <line 
          x1="80%" y1="38%" x2="65%" y2="80%" 
          {...getLineStyle(activeRole === AgentRole.CODER && statuses[AgentRole.CRITIC] === AgentStatus.IDLE)}
          markerEnd={activeRole === AgentRole.CODER && statuses[AgentRole.CRITIC] === AgentStatus.IDLE ? "url(#arrowhead-blue)" : "url(#arrowhead)"} 
        />
        
        {/* Coder -> Critic (Review Loop) */}
        <line 
          x1="65%" y1="80%" x2="20%" y2="38%" 
          {...getLineStyle(activeRole === AgentRole.CRITIC)}
          markerEnd={activeRole === AgentRole.CRITIC ? "url(#arrowhead-blue)" : "url(#arrowhead)"} 
        />

        {/* Critic -> Coder (Rejection Loop) */}
        {statuses[AgentRole.CRITIC] === AgentStatus.REJECTED && (
          <path 
            d="M 20% 38% Q 42% 60% 65% 80%" 
            fill="none" 
            {...getLineStyle(true, true)}
            markerEnd="url(#arrowhead-red)" 
          />
        )}
        
        {/* Coder -> Critic (Fix Loop - Green/Blue) */}
        {activeRole === AgentRole.CODER && statuses[AgentRole.CRITIC] !== AgentStatus.IDLE && (
           <path 
            d="M 65% 80% Q 42% 60% 20% 38%" 
            fill="none" 
            {...getLineStyle(true)}
            markerEnd="url(#arrowhead-blue)" 
          />
        )}

        {/* Runtime Failure / Coder -> Healer */}
         <line 
           x1="65%" y1="80%" x2="25%" y2="80%" 
           {...getLineStyle(activeRole === AgentRole.HEALER, true)}
           stroke={activeRole === AgentRole.HEALER ? "#ef4444" : "#cbd5e1"}
           markerEnd={activeRole === AgentRole.HEALER ? "url(#arrowhead-red)" : "url(#arrowhead)"} 
         />
         
         {/* Healer -> Coder (Patch) */}
         {statuses[AgentRole.HEALER] === AgentStatus.SUCCESS && (
            <path 
              d="M 25% 80% Q 45% 95% 65% 80%" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="2" 
              strokeDasharray="6,4" 
              className="animate-flow"
              markerEnd="url(#arrowhead-purple)" 
            />
         )}

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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
        <div className="text-slate-400 text-[10px] tracking-widest uppercase mb-1">QualiSync Core</div>
        <div className="w-32 h-32 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50/50">
           <div className={`w-24 h-24 rounded-full blur-xl transition-colors duration-1000 ${
             statuses[AgentRole.HEALER] === AgentStatus.THINKING ? 'bg-red-200/50' :
             statuses[AgentRole.CRITIC] === AgentStatus.REJECTED ? 'bg-red-200/50' :
             activeRole !== AgentRole.IDLE ? 'bg-blue-100/50' : 'bg-slate-100/50'
           }`}></div>
        </div>
      </div>
    </div>
  );
};

export default AgentVisualizer;