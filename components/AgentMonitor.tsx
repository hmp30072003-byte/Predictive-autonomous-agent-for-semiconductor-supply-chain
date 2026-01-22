import React from 'react';
import { Brain, Cpu, ShieldAlert, Wifi, Activity, Terminal } from 'lucide-react';

interface AgentMonitorProps {
  currentDay: number;
  riskLevel: number;
  action: string | null;
}

export const AgentMonitor: React.FC<AgentMonitorProps> = ({ currentDay, riskLevel, action }) => {
  const isHighRisk = riskLevel > 0.5;
  const isIntervening = action && action.includes("Expediting");

  return (
    <div className="bg-slate-900 text-cyan-400 p-4 rounded-lg shadow-lg border border-cyan-800 font-mono text-sm relative overflow-hidden mb-6">
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, .3) 25%, rgba(34, 211, 238, .3) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .3) 75%, rgba(34, 211, 238, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, .3) 25%, rgba(34, 211, 238, .3) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .3) 75%, rgba(34, 211, 238, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-900/50 rounded-md border border-cyan-700">
             <Brain size={18} className={isHighRisk ? "animate-pulse text-red-400" : "text-cyan-300"} />
          </div>
          <div>
            <h3 className="font-bold text-cyan-100 leading-none">PAA AGENT KERNEL</h3>
            <span className="text-xs text-cyan-600">v2.4.1-Stable</span>
          </div>
        </div>
        <div className="text-right">
           <div className="flex items-center gap-2 justify-end text-xs text-cyan-500 mb-1">
             <Wifi size={12} className="animate-pulse" />
             <span>CONNECTED</span>
           </div>
           <div className="text-2xl font-bold text-white leading-none">Day {currentDay}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        
        {/* Risk Monitor */}
        <div className={`p-3 rounded border ${isHighRisk ? 'bg-red-900/20 border-red-800' : 'bg-slate-800 border-slate-700'}`}>
           <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={14} className={isHighRisk ? "text-red-400" : "text-slate-400"} />
              <span className={`text-xs font-bold uppercase ${isHighRisk ? "text-red-400" : "text-slate-400"}`}>Disruption Risk</span>
           </div>
           <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isHighRisk ? 'bg-red-500' : 'bg-cyan-500'}`} 
                style={{ width: `${Math.max(5, riskLevel * 100)}%` }}
              ></div>
           </div>
           <div className="flex justify-between mt-1">
             <span className="text-xs opacity-50">Low</span>
             <span className="text-xs font-bold">{Math.round(riskLevel * 100)}%</span>
             <span className="text-xs opacity-50">High</span>
           </div>
        </div>

        {/* Action Terminal */}
        <div className="p-3 bg-black/40 rounded border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
               <Terminal size={12} className="text-green-400" />
               <span className="text-xs font-bold text-slate-400 uppercase">Decision Log</span>
            </div>
            <div className="text-xs font-mono h-10 flex items-center">
               {action ? (
                 <span className={`${isHighRisk ? 'text-yellow-300' : 'text-green-300'} animate-pulse`}>
                    &gt; {action}
                 </span>
               ) : (
                 <span className="text-slate-600">&gt; Monitoring system parameters...</span>
               )}
            </div>
        </div>
      </div>

      {/* Bullwhip Dampener Indicator */}
      {isIntervening && (
        <div className="mt-4 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded flex items-center gap-3 relative z-10 animate-in fade-in slide-in-from-bottom-2">
           <Activity size={16} className="text-yellow-400" />
           <div>
             <div className="text-xs font-bold text-yellow-100">BULLWHIP DAMPENING ACTIVE</div>
             <div className="text-[10px] text-yellow-400/80">Pre-emptive ordering to prevent future oscillation.</div>
           </div>
        </div>
      )}

    </div>
  );
};
