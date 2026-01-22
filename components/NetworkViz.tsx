import React from 'react';
import { NodeStatus } from '../types';

interface NetworkVizProps {
  fabStatus: NodeStatus;
  currentDay: number;
  totalDays: number;
}

export const NetworkViz: React.FC<NetworkVizProps> = ({ fabStatus, currentDay, totalDays }) => {
  const isFabDown = fabStatus === NodeStatus.DISRUPTED;

  const steps = [
    { id: 'supplier', label: 'Raw Materials', icon: '⛰️' },
    { id: 'fab', label: 'Wafer Fab', icon: '🏭', status: fabStatus },
    { id: 'assembly', label: 'Assembly & Test', icon: '🔧' },
    { id: 'warehouse', label: 'Distribution', icon: '📦' },
    { id: 'oem', label: 'OEM Customer', icon: '📱' },
  ];

  const progress = (currentDay / totalDays) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>

        <div className="flex justify-between items-center relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 transform -translate-y-1/2"></div>
          
          {steps.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md border-4 transition-all duration-500
                  ${step.status === NodeStatus.DISRUPTED ? 'bg-red-100 border-red-500 animate-pulse' : 'bg-white border-blue-500'}
                  ${step.status === NodeStatus.RECOVERING ? 'border-yellow-400' : ''}
                `}
              >
                {step.icon}
              </div>
              <div className="mt-2 text-center">
                <p className="font-bold text-sm text-gray-800">{step.label}</p>
                {step.id === 'fab' && isFabDown && (
                  <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full mt-1 inline-block">
                    ⚠️ DISRUPTION
                  </span>
                )}
              </div>
              
              {/* Flow Animation Dots */}
              {idx < steps.length - 1 && !isFabDown && (
                <div className="absolute -right-1/2 top-1/2 transform -translate-y-1/2 w-full h-full pointer-events-none">
                   <div className="animate-flow-dot w-2 h-2 bg-blue-400 rounded-full absolute top-1/2 left-0"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-between text-xs text-gray-400">
           <div className="w-1/5 text-center">Material Flow &rarr;</div>
           <div className="w-1/5 text-center">Avg Lead: 10d</div>
           <div className="w-1/5 text-center">Avg Lead: 5d</div>
           <div className="w-1/5 text-center">Avg Lead: 3d</div>
           <div className="w-1/5 text-center">Demand Pull</div>
        </div>

        <style>{`
          @keyframes flow {
            0% { left: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          .animate-flow-dot {
            animation: flow 2s linear infinite;
          }
        `}</style>
    </div>
  );
};
