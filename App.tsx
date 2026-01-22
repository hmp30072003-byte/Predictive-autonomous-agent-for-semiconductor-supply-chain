import React, { useState, useEffect, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultsCharts } from './components/ResultsCharts';
import { NetworkViz } from './components/NetworkViz';
import { DEFAULT_CONFIG } from './constants';
import { runSimulation } from './services/simulation';
import { SimulationConfig, SimulationResult, NodeStatus } from './types';
import { Activity, AlertTriangle, ShieldCheck, Truck } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [resultsReactive, setResultsReactive] = useState<SimulationResult | null>(null);
  const [resultsPAA, setResultsPAA] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationDay, setSimulationDay] = useState(0);
  const [fabStatus, setFabStatus] = useState(NodeStatus.NORMAL);

  const handleRunSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationDay(0);

    // Run backend logic (simulating Python Engine)
    const resReactive = runSimulation(config, 'REACTIVE');
    const resPAA = runSimulation(config, 'PAA');

    setResultsReactive(resReactive);
    setResultsPAA(resPAA);

    // Start visual playback
    let day = 0;
    const interval = setInterval(() => {
      day += 2; // Speed up playback
      if (day > config.simulationDuration) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationDay(config.simulationDuration);
        setFabStatus(NodeStatus.NORMAL);
      } else {
        setSimulationDay(day);
        // Update Visual Fab Status based on Reactive data (baseline)
        const isDisrupted = resReactive.stats[Math.min(day, resReactive.stats.length - 1)].disruptionActive;
        setFabStatus(isDisrupted ? NodeStatus.DISRUPTED : NodeStatus.NORMAL);
      }
    }, 20); // 20ms per frame
  }, [config]);

  // Initial Run
  useEffect(() => {
    handleRunSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-blue-400" />
              Semiconductor Supply Chain <span className="text-blue-400 font-light">Digital Twin</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Hyper-Resilient Predictive Autonomous Agents (PAA) Simulation
            </p>
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`
              px-6 py-2 rounded font-bold shadow-md transition-all
              ${isSimulating 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20'
              }
            `}
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration (Excel-like) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              Configuration Panel
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Adjust parameters below to model different supply chain scenarios. 
              This acts as the <strong>Excel UI</strong> layer interacting with the backend engine.
            </p>
            <ConfigPanel config={config} onConfigChange={setConfig} />
          </div>

          {/* Key Metrics Summary */}
          {resultsReactive && resultsPAA && (
            <div className="grid grid-cols-1 gap-4">
               <KPICard 
                  title="Service Level (Reactive)" 
                  value={`${resultsReactive.kpis.serviceLevel.toFixed(1)}%`}
                  trend="down"
                  icon={<AlertTriangle size={20} />}
                  color="red"
               />
               <KPICard 
                  title="Service Level (PAA)" 
                  value={`${resultsPAA.kpis.serviceLevel.toFixed(1)}%`}
                  trend="up"
                  icon={<ShieldCheck size={20} />}
                  color="green"
               />
               <KPICard 
                  title="Resilience Score Gain" 
                  value={`+${(resultsPAA.kpis.resilienceScore - resultsReactive.kpis.resilienceScore).toFixed(1)}`}
                  trend="neutral"
                  icon={<Activity size={20} />}
                  color="blue"
               />
            </div>
          )}
        </div>

        {/* Right Column: Visualization & Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Network Viz */}
          <NetworkViz 
            fabStatus={fabStatus} 
            currentDay={simulationDay} 
            totalDays={config.simulationDuration} 
          />

          {/* Charts */}
          {resultsReactive && resultsPAA ? (
             <ResultsCharts dataReactive={resultsReactive.stats} dataPAA={resultsPAA.stats} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Loading Simulation Data...
            </div>
          )}

          {/* Detailed Logic Explanation */}
          <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 text-sm text-slate-700">
            <h3 className="font-bold mb-2 text-slate-900">How It Works (B.Tech Project Logic)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Reactive Mode:</strong> Uses fixed reorder points. When Fab disrupts, the warehouse stocks out after lead times.</li>
              <li><strong>PAA Mode (Predictive Agents):</strong> Agents monitor 'Disruption Probability'. If a high risk is detected (e.g., probability spike), the <strong>Autonomous Warehouse Agent</strong> triggers an emergency pre-order.</li>
              <li><strong>Simulation Engine:</strong> Modeled in TypeScript (replacing Python/SimPy) using discrete daily steps for demand, production, and transit queues.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper KPI Component
const KPICard: React.FC<{title: string, value: string, trend: 'up' | 'down' | 'neutral', icon: React.ReactNode, color: 'red' | 'green' | 'blue'}> = ({ title, value, trend, icon, color }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between ${colorClasses[color]}`}>
      <div>
        <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-white bg-opacity-60`}>
        {icon}
      </div>
    </div>
  );
};

export default App;
