import React from 'react';
import { SimulationConfig } from '../types';

interface ConfigPanelProps {
  config: SimulationConfig;
  onConfigChange: (newConfig: SimulationConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const handleChange = (key: keyof SimulationConfig, value: string) => {
    onConfigChange({
      ...config,
      [key]: Number(value)
    });
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
      <div className="bg-green-700 text-white px-4 py-2 font-semibold text-sm flex justify-between items-center">
        <span>SupplyChain_Config.xlsx</span>
        <span className="text-xs bg-green-800 px-2 py-0.5 rounded">Editable</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 w-10 text-gray-500 font-normal border-r text-center">#</th>
              <th className="px-4 py-2 border-r font-medium text-gray-700">Parameter</th>
              <th className="px-4 py-2 border-r font-medium text-gray-700">Value</th>
              <th className="px-4 py-2 font-medium text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'fabCapacity', label: 'Fab Capacity', desc: 'Wafers produced per day' },
              { key: 'initialInventory', label: 'Initial Inventory', desc: 'Starting units in Warehouse' },
              { key: 'minDemand', label: 'Min Demand', desc: 'Daily OEM demand lower bound' },
              { key: 'maxDemand', label: 'Max Demand', desc: 'Daily OEM demand upper bound' },
              { key: 'reorderLevel', label: 'Reorder Level', desc: 'Threshold to trigger new order' },
              { key: 'reorderQuantity', label: 'Reorder Quantity', desc: 'Batch size per order' },
              { key: 'leadTimeFab', label: 'Fab Lead Time', desc: 'Days to fabricate wafer' },
              { key: 'leadTimeAssembly', label: 'Assy Lead Time', desc: 'Days to assemble & test' },
              { key: 'leadTimeTransport', label: 'Transport Time', desc: 'Days transit to warehouse' },
              { key: 'disruptionProb', label: 'Disruption Prob', desc: 'Probability (0-1) of failure' },
              { key: 'simulationDuration', label: 'Sim Duration', desc: 'Total days to simulate' },
            ].map((row, idx) => (
              <tr key={row.key} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2 border-r bg-gray-50 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-2 border-r font-mono text-blue-800">{row.label}</td>
                <td className="px-4 py-2 border-r p-0">
                  <input
                    type="number"
                    className="w-full h-full px-4 py-2 focus:outline-none focus:bg-white bg-transparent"
                    value={config[row.key as keyof SimulationConfig]}
                    onChange={(e) => handleChange(row.key as keyof SimulationConfig, e.target.value)}
                    step={row.key === 'disruptionProb' ? 0.001 : 1}
                  />
                </td>
                <td className="px-4 py-2 text-gray-500 italic">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
