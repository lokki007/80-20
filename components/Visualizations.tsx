import React from 'react';
import { ParetoDataPoint, RevenueStream } from '../types';

interface ChartProps {
  data: ParetoDataPoint[];
  className?: string;
}

// Minimalist Bar Chart for Impact
export const ImpactChart: React.FC<ChartProps> = ({ data, className }) => {
  // Sort by impact descending
  const sortedData = [...data].sort((a, b) => b.impactValue - a.impactValue);
  const maxVal = Math.max(...sortedData.map(d => d.impactValue));

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {sortedData.map((item, i) => (
        <div key={i} className="group relative">
          <div className="flex justify-between text-xs font-mono uppercase tracking-wider mb-1">
            <span>{item.label}</span>
            <span>{item.impactValue}% Impact</span>
          </div>
          <div className="w-full h-8 bg-gray-100 border border-black/10 relative overflow-hidden">
             {/* The Bar */}
            <div 
              className="h-full bg-black transition-all duration-1000 ease-out"
              style={{ width: `${(item.impactValue / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Fractal Grid Visualization (100 -> 20 -> 4 -> 1)
export const FractalGrid = ({ level }: { level: number }) => {
  // Level 1: Highlight 20 cells
  // Level 2: Highlight 4 cells
  // Level 3: Highlight 1 cell
  
  const totalCells = 100;
  const activeCells = level === 1 ? 20 : level === 2 ? 4 : 1;
  
  return (
    <div className="aspect-square grid grid-cols-10 border-t border-l border-black bg-white">
      {Array.from({ length: totalCells }).map((_, i) => (
        <div 
          key={i} 
          className={`
            border-b border-r border-black/10 
            transition-all duration-500
            ${i < activeCells ? 'bg-black' : 'bg-transparent'}
          `}
        />
      ))}
    </div>
  );
};

// Revenue/Resource Scatter or Split
export const ResourceAllocationChart = ({ streams }: { streams: RevenueStream[] }) => {
  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between border-b border-black pb-2">
         <span className="font-mono text-xs uppercase">Allocation (Input)</span>
         <span className="font-mono text-xs uppercase">Revenue (Output)</span>
      </div>
      
      {streams.map((stream, idx) => (
        <div key={idx} className="relative py-4 border-b border-dashed border-gray-300">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold font-mono">
              {stream.name}
           </div>
           
           <div className="flex items-center gap-4">
              {/* Input Side (Left) */}
              <div className="flex-1 flex justify-end">
                 <div className="h-4 bg-gray-300" style={{ width: `${stream.focusAllocation}%` }}></div>
                 <span className="ml-2 text-xs font-mono w-8 text-right">{stream.focusAllocation}%</span>
              </div>
              
              {/* Center Pivot */}
              <div className="w-2 h-2 bg-black rounded-full shrink-0"></div>
              
              {/* Output Side (Right) */}
              <div className="flex-1 flex justify-start">
                 <span className="mr-2 text-xs font-mono w-8">{stream.revenuePotential}%</span>
                 <div className="h-4 bg-black" style={{ width: `${stream.revenuePotential}%` }}></div>
              </div>
           </div>
        </div>
      ))}
      <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-4">
         Leverage Ratio Visualization
      </div>
    </div>
  );
};
