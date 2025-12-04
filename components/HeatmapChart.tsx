
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { RiskPoint } from '../types';

interface HeatmapChartProps {
  data: RiskPoint[];
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  
  const getColor = (risk: number) => {
    if (risk > 75) return '#ef4444'; // Red-500
    if (risk > 45) return '#eab308'; // Yellow-500
    return '#22c55e'; // Green-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-2 rounded shadow-xl text-xs text-slate-900">
          <p className="font-bold">{data.feature}</p>
          <p className="text-slate-500">Impact: {data.impact}</p>
          <p className="text-slate-500">Likelihood: {data.likelihood}</p>
          <p className="text-slate-500">Risk Score: {data.riskScore}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="impact" 
            name="Business Impact" 
            unit="%" 
            domain={[0, 100]}
            stroke="#64748b"
            label={{ value: 'Business Impact', position: 'insideBottom', offset: -10, fill: '#64748b' }}
          />
          <YAxis 
            type="number" 
            dataKey="likelihood" 
            name="Failure Probability" 
            unit="%" 
            domain={[0, 100]}
            stroke="#64748b"
            label={{ value: 'Failure Likelihood', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          
          {/* Risk Zones Background */}
          <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#22c55e" fillOpacity={0.1} />
          <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#ef4444" fillOpacity={0.1} />

          <Scatter name="Risks" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.riskScore)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeatmapChart;
