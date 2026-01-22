import { SimulationConfig } from './types';

export const DEFAULT_CONFIG: SimulationConfig = {
  fabCapacity: 1000,
  initialInventory: 5000,
  minDemand: 150,
  maxDemand: 300,
  reorderLevel: 2000,
  reorderQuantity: 3000,
  leadTimeFab: 10,       // Wafer start to finish
  leadTimeAssembly: 5,   // Packaging
  leadTimeTransport: 3,  // Shipping
  disruptionProb: 0.005, // 0.5% chance per day
  simulationDuration: 180
};
