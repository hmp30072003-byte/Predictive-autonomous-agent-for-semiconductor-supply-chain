export enum NodeStatus {
  NORMAL = 'NORMAL',
  DISRUPTED = 'DISRUPTED',
  RECOVERING = 'RECOVERING'
}

export interface SimulationConfig {
  fabCapacity: number;     // Wafers per day
  initialInventory: number; // Units
  minDemand: number;
  maxDemand: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeFab: number;     // Days
  leadTimeAssembly: number; // Days
  leadTimeTransport: number; // Days
  disruptionProb: number;  // 0-1
  simulationDuration: number; // Days
}

export interface DailyStats {
  day: number;
  demand: number;
  inventoryWarehouse: number;
  wipFab: number;
  wipAssembly: number;
  backorders: number;
  sales: number;
  disruptionActive: boolean;
  predictedRisk: number; // For PAA
  orderQuantity: number; // For Bullwhip chart
  agentAction: string | null; // For Agent Monitor
}

export interface SimulationResult {
  stats: DailyStats[];
  kpis: {
    totalCost: number;
    avgDelay: number;
    serviceLevel: number; // %
    resilienceScore: number; // Custom metric
    totalStockouts: number;
  };
}

export interface AgentDecision {
  action: string;
  quantity: number;
  reason: string;
}
