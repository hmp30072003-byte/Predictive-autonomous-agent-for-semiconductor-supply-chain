import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { DailyStats } from '../types';

interface ResultsChartsProps {
  dataReactive: DailyStats[];
  dataPAA: DailyStats[];
}

export const ResultsCharts: React.FC<ResultsChartsProps> = ({ dataReactive, dataPAA }) => {
  // Merge data for comparison
  const mergedData = dataReactive.map((d, i) => ({
    day: d.day,
    reactiveInv: d.inventoryWarehouse,
    paaInv: dataPAA[i]?.inventoryWarehouse || 0,
    reactiveBackorders: d.backorders,
    paaBackorders: dataPAA[i]?.backorders || 0,
    disruption: d.disruptionActive ? 1 : 0
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Resilience Comparison</h3>
        <p className="text-sm text-gray-500 mb-2">Comparison of Warehouse Inventory levels during disruptions.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <defs>
                <linearGradient id="colorPAA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReactive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="paaInv" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorPAA)" 
                name="PAA Inventory (Hyper-Resilient)"
              />
              <Area 
                type="monotone" 
                dataKey="reactiveInv" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorReactive)" 
                name="Traditional Inventory"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Backorders / Shortages Impact</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reactiveBackorders" stroke="#ef4444" strokeWidth={2} name="Traditional Backorders" />
              <Line type="monotone" dataKey="paaBackorders" stroke="#10b981" strokeWidth={2} name="PAA Backorders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
