// src/components/organisms/EvolutionChart.tsx
'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

interface ChartDataPoint {
  month: string;
  sellIn2025: number;
  sellOut2025: number;
  marge2025: number;
  sellIn2024: number;
  sellOut2024: number;
  marge2024: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}

const mockData: ChartDataPoint[] = [
  { month: 'Jan', sellIn2025: 190, sellOut2025: 235, marge2025: 52, sellIn2024: 180, sellOut2024: 220, marge2024: 45 },
  { month: 'Fév', sellIn2025: 185, sellOut2025: 255, marge2025: 58, sellIn2024: 175, sellOut2024: 240, marge2024: 52 },
  { month: 'Mar', sellIn2025: 200, sellOut2025: 260, marge2025: 55, sellIn2024: 190, sellOut2024: 245, marge2024: 48 },
  { month: 'Avr', sellIn2025: 195, sellOut2025: 270, marge2025: 62, sellIn2024: 185, sellOut2024: 255, marge2024: 55 },
  { month: 'Mai', sellIn2025: 210, sellOut2025: 280, marge2025: 65, sellIn2024: 200, sellOut2024: 265, marge2024: 58 },
  { month: 'Jun', sellIn2025: 205, sellOut2025: 285, marge2025: 68, sellIn2024: 195, sellOut2024: 270, marge2024: 62 },
  { month: 'Jul', sellIn2025: 220, sellOut2025: 295, marge2025: 72, sellIn2024: 210, sellOut2024: 280, marge2024: 65 },
  { month: 'Aoû', sellIn2025: 215, sellOut2025: 290, marge2025: 70, sellIn2024: 205, sellOut2024: 275, marge2024: 63 },
  { month: 'Sep', sellIn2025: 230, sellOut2025: 305, marge2025: 75, sellIn2024: 220, sellOut2024: 290, marge2024: 68 },
  { month: 'Oct', sellIn2025: 235, sellOut2025: 310, marge2025: 78, sellIn2024: 225, sellOut2024: 295, marge2024: 70 },
  { month: 'Nov', sellIn2025: 245, sellOut2025: 325, marge2025: 82, sellIn2024: 235, sellOut2024: 310, marge2024: 75 },
  { month: 'Déc', sellIn2025: 250, sellOut2025: 335, marge2025: 85, sellIn2024: 240, sellOut2024: 320, marge2024: 78 }
];

const formatCurrency = (value: number): string => `${value}k €`;

const calculateEvolution = (current: number, previous: number): string => {
  const evolution = ((current - previous) / previous * 100);
  return evolution >= 0 ? `+${evolution.toFixed(1)}%` : `${evolution.toFixed(1)}%`;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    // Accès sécurisé aux données via le premier élément du payload
    const firstPayload = payload[0];
    if (!firstPayload || typeof firstPayload !== 'object' || !('payload' in firstPayload)) {
      return null;
    }
    
    const data = (firstPayload as any).payload;
    
    return (
      <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 min-w-[280px]">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">{label} 2025</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600 font-medium">Sell-In</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">{formatCurrency(data.sellIn2025)}</span>
              <span className="text-xs text-green-600 ml-3 font-medium">
                {calculateEvolution(data.sellIn2025, data.sellIn2024)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600 font-medium">Sell-Out</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">{formatCurrency(data.sellOut2025)}</span>
              <span className="text-xs text-green-600 ml-3 font-medium">
                {calculateEvolution(data.sellOut2025, data.sellOut2024)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600 font-medium">Marge</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">{formatCurrency(data.marge2025)}</span>
              <span className="text-xs text-green-600 ml-3 font-medium">
                {calculateEvolution(data.marge2025, data.marge2024)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <span className="text-xs text-gray-500 font-medium">vs {label} 2024</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function EvolutionChart() {
  const [visibleLines, setVisibleLines] = useState({
    sellIn2025: true,
    sellOut2025: true,
    marge2025: true,
    sellIn2024: true,
    sellOut2024: true,
    marge2024: true
  });

  const handleLegendClick = (dataKey: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev]
    }));
  };

  const CustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-6 mb-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">2025</span>
        
        <button
          onClick={() => handleLegendClick('sellIn2025')}
          className={`flex items-center space-x-2 px-2 py-1 rounded transition-opacity ${
            visibleLines.sellIn2025 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-xs text-gray-600">Sell-In</span>
        </button>
        
        <button
          onClick={() => handleLegendClick('sellOut2025')}
          className={`flex items-center space-x-2 px-2 py-1 rounded transition-opacity ${
            visibleLines.sellOut2025 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-xs text-gray-600">Sell-Out</span>
        </button>
        
        <button
          onClick={() => handleLegendClick('marge2025')}
          className={`flex items-center space-x-2 px-2 py-1 rounded transition-opacity ${
            visibleLines.marge2025 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="w-3 h-0.5 bg-orange-500"></div>
          <span className="text-xs text-gray-600">Marge</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-500">2024</span>
        
        <button
          onClick={() => handleLegendClick('sellIn2024')}
          className={`flex items-center space-x-2 px-2 py-1 rounded transition-opacity ${
            visibleLines.sellIn2024 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="w-3 h-0.5 bg-blue-400 opacity-60" style={{ borderTop: '2px dashed' }}></div>
          <span className="text-xs text-gray-500">Sell-In</span>
        </button>
        
        <button
          onClick={() => handleLegendClick('sellOut2024')}
          className={`flex items-center space-x-2 px-2 py-1 rounded transition-opacity ${
            visibleLines.sellOut2024 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="w-3 h-0.5 bg-green-400 opacity-60" style={{ borderTop: '2px dashed' }}></div>
          <span className="text-xs text-gray-500">Sell-Out</span>
        </button>
        
        <button
          onClick={() => handleLegendClick('marge2024')}
          className={`flex items-center space-x-2 px-2 py-1 rounded transition-opacity ${
            visibleLines.marge2024 ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="w-3 h-0.5 bg-orange-400 opacity-60" style={{ borderTop: '2px dashed' }}></div>
          <span className="text-xs text-gray-500">Marge</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-80">
      <CustomLegend />
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="sellIn2025" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="sellOut2025" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="marge2025" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Lignes 2025 (pleines) */}
          {visibleLines.sellIn2025 && (
            <Line
              type="monotone"
              dataKey="sellIn2025"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          )}
          
          {visibleLines.sellOut2025 && (
            <Line
              type="monotone"
              dataKey="sellOut2025"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
          )}
          
          {visibleLines.marge2025 && (
            <Line
              type="monotone"
              dataKey="marge2025"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f97316' }}
              activeDot={{ r: 6, fill: '#f97316' }}
            />
          )}
          
          {/* Lignes 2024 (pointillés) */}
          {visibleLines.sellIn2024 && (
            <Line
              type="monotone"
              dataKey="sellIn2024"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#60a5fa', opacity: 0.6 }}
              activeDot={{ r: 5, fill: '#60a5fa', opacity: 0.6 }}
            />
          )}
          
          {visibleLines.sellOut2024 && (
            <Line
              type="monotone"
              dataKey="sellOut2024"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#34d399', opacity: 0.6 }}
              activeDot={{ r: 5, fill: '#34d399', opacity: 0.6 }}
            />
          )}
          
          {visibleLines.marge2024 && (
            <Line
              type="monotone"
              dataKey="marge2024"
              stroke="#fb923c"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#fb923c', opacity: 0.6 }}
              activeDot={{ r: 5, fill: '#fb923c', opacity: 0.6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}