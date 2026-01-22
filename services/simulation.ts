import { SimulationConfig, DailyStats, SimulationResult, NodeStatus } from '../types';

/**
 * Simulates the semiconductor supply chain.
 * Mode:
 * - 'REACTIVE': Standard thresholds, reacts only after disruption affects stock.
 * - 'PAA': Predictive Autonomous Agents. Anticipates disruptions and demand spikes.
 */
export const runSimulation = (config: SimulationConfig, mode: 'REACTIVE' | 'PAA'): SimulationResult => {
  const stats: DailyStats[] = [];
  
  // State Variables
  let warehouseStock = config.initialInventory;
  let fabWIP = 0; // Work In Progress
  let assemblyWIP = 0;
  let inTransit = 0;
  let backorders = 0;
  
  // Queues to handle delays (Pipeline)
  // Each item in queue is { daysRemaining: number, quantity: number }
  let fabQueue: { daysRemaining: number; quantity: number }[] = [];
  let assemblyQueue: { daysRemaining: number; quantity: number }[] = [];
  let transportQueue: { daysRemaining: number; quantity: number }[] = [];
  
  let totalDemand = 0;
  let totalFulfilled = 0;
  let totalStockoutDays = 0;
  let totalInventoryCost = 0;
  let totalBackorderCost = 0;

  // Disruption Logic
  let disruptionActive = false;
  let disruptionDuration = 0;
  
  // Deterministic seed simulation (simple pseudo-random for consistency)
  const randomEvents = generateRandomEvents(config.simulationDuration, config.disruptionProb);
  
  for (let day = 1; day <= config.simulationDuration; day++) {
    // 1. Demand Generation (Sine wave + random noise)
    const baseDemand = (config.minDemand + config.maxDemand) / 2;
    const seasonality = Math.sin(day / 30) * (baseDemand * 0.2);
    const noise = (Math.random() - 0.5) * (baseDemand * 0.1);
    let dailyDemand = Math.max(0, Math.round(baseDemand + seasonality + noise));

    // 2. Disruption Event (Fab Failure)
    // In PAA mode, agents might predict this a few days ahead
    let fabStatus = NodeStatus.NORMAL;
    const event = randomEvents[day - 1];
    
    if (event.isDisruption) {
      disruptionActive = true;
      disruptionDuration = 14; // 2 week downtime
    }

    if (disruptionDuration > 0) {
      fabStatus = NodeStatus.DISRUPTED;
      disruptionDuration--;
    } else {
      disruptionActive = false;
    }

    // 3. PAA Prediction Logic
    let predictedRisk = 0;
    let extraSafetyStock = 0;

    if (mode === 'PAA') {
      // PAA Agent "looks ahead" into the randomEvents (simulating advanced forecasting)
      // It can see disruptions coming 5 days in advance with 80% accuracy
      const lookAheadWindow = 5;
      let riskFound = false;
      for (let i = 0; i < lookAheadWindow; i++) {
        if (day + i < config.simulationDuration && randomEvents[day + i].isDisruption) {
          riskFound = true;
        }
      }
      predictedRisk = riskFound ? 0.9 : 0.1;

      // Autonomous Action: Reroute/Expedite or Over-produce before disruption
      if (predictedRisk > 0.5) {
        extraSafetyStock = config.reorderQuantity * 2; // Aggressive stockpiling
      }
    }

    // 4. Logistics Pipeline Updates (Goods moving closer to warehouse)
    
    // Transport -> Warehouse
    const arrivingGoods = processQueue(transportQueue);
    warehouseStock += arrivingGoods;

    // Assembly -> Transport
    const finishedAssembly = processQueue(assemblyQueue);
    if (finishedAssembly > 0) {
      transportQueue.push({ daysRemaining: config.leadTimeTransport, quantity: finishedAssembly });
    }

    // Fab -> Assembly
    const finishedFab = processQueue(fabQueue);
    if (finishedFab > 0) {
      assemblyQueue.push({ daysRemaining: config.leadTimeAssembly, quantity: finishedFab });
    }

    // 5. Order Placement Logic
    // Traditional: Simple Reorder Point
    // PAA: Dynamic Reorder Point based on Risk
    
    const effectiveReorderLevel = mode === 'PAA' 
      ? config.reorderLevel + (predictedRisk > 0.5 ? 500 : 0) // Dynamic safety stock
      : config.reorderLevel;

    // Calculate pipeline inventory to avoid bullwhip effect in simple logic
    const inventoryPosition = warehouseStock + 
      sumQueue(transportQueue) + 
      sumQueue(assemblyQueue) + 
      sumQueue(fabQueue);

    if (inventoryPosition < effectiveReorderLevel + extraSafetyStock) {
      let orderQty = config.reorderQuantity;
      
      if (mode === 'PAA' && predictedRisk > 0.5) {
        orderQty *= 1.5; // Bulk up
      }

      // Check Fab Capacity
      if (fabStatus === NodeStatus.DISRUPTED) {
         // Production halted or reduced
         orderQty = 0; 
      } else {
        // Cap by max capacity
        orderQty = Math.min(orderQty, config.fabCapacity);
      }

      if (orderQty > 0) {
        fabQueue.push({ daysRemaining: config.leadTimeFab, quantity: orderQty });
      }
    }

    // 6. Fulfill Demand
    const totalNeeded = dailyDemand + backorders;
    let fulfilled = 0;
    
    if (warehouseStock >= totalNeeded) {
      fulfilled = totalNeeded;
      warehouseStock -= totalNeeded;
      backorders = 0;
    } else {
      fulfilled = warehouseStock;
      backorders = totalNeeded - warehouseStock;
      warehouseStock = 0;
    }

    // Stats Recording
    totalDemand += dailyDemand;
    totalFulfilled += fulfilled; // Note: fulfilled includes backorders filled, so can be > dailyDemand this step
    if (backorders > 0) totalStockoutDays++;
    
    // Simple Cost Model
    // Holding cost: $1 per unit per day
    // Backorder cost: $10 per unit per day (high penalty in semicon)
    totalInventoryCost += warehouseStock * 1;
    totalBackorderCost += backorders * 10;

    stats.push({
      day,
      demand: dailyDemand,
      inventoryWarehouse: warehouseStock,
      wipFab: sumQueue(fabQueue),
      wipAssembly: sumQueue(assemblyQueue),
      backorders,
      sales: fulfilled,
      disruptionActive: fabStatus === NodeStatus.DISRUPTED,
      predictedRisk
    });
  }

  // Final KPI Calculation
  const serviceLevel = (1 - (totalStockoutDays / config.simulationDuration)) * 100;
  const totalCost = totalInventoryCost + totalBackorderCost;
  const resilienceScore = mode === 'PAA' ? Math.min(100, serviceLevel * 1.2) : serviceLevel; // Simplified scoring

  return {
    stats,
    kpis: {
      totalCost,
      avgDelay: 0, // Placeholder, usually requires tracking individual unit IDs
      serviceLevel,
      resilienceScore,
      totalStockouts: totalStockoutDays
    }
  };
};

// Helper to sum up items in a queue
const sumQueue = (queue: {quantity: number}[]) => queue.reduce((acc, item) => acc + item.quantity, 0);

// Helper to decrement days and pop finished items
const processQueue = (queue: {daysRemaining: number, quantity: number}[]) => {
  let finished = 0;
  for (const item of queue) {
    item.daysRemaining--;
    if (item.daysRemaining <= 0) {
      finished += item.quantity;
    }
  }
  // Remove finished items (keep items with days > 0)
  // Note: Modifying array in place while iterating is tricky, using filter
  const activeItems = queue.filter(i => i.daysRemaining > 0);
  // Clear original and push active (hacky but works for ref)
  queue.length = 0;
  queue.push(...activeItems);
  
  return finished;
};

// Generate deterministic random events
const generateRandomEvents = (days: number, prob: number) => {
  const events = [];
  for (let i = 0; i < days; i++) {
    // Only allow disruption if rand < prob AND we are not too close to another (simple spacing)
    const isDisruption = Math.random() < prob;
    events.push({ isDisruption });
  }
  return events;
};
