// src/components/organisms/EvolutionChart/EvolutionChart.tsx
'use client';

import React, { useState, useMemo } from 'react';
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

// Types
interface ChartDataPoint {
  period: string;
  sellIn: number | null;
  sellOut: number | null;
  marge: number | null;
  stock: number | null;
}

interface EvolutionChartProps {
  data: ChartDataPoint[] | null;
  mode: 'monthly' | 'quarterly';
  loading?: boolean;
  error?: string | null;
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
  mode: 'monthly' | 'quarterly';
}

// Fonction de formatage
const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`;
  return `${Math.round(value)} €`;
};

// Tooltip personnalisé
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    const firstPayload = payload[0];
    if (!firstPayload || typeof firstPayload !== 'object' || !('payload' in firstPayload)) {
      return null;
    }
    
    const data = (firstPayload as any).payload as ChartDataPoint;
    
    return (
      <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 min-w-[280px]">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">
          {label}
        </h4>
        <div className="space-y-3">
          {/* Sell-In */}
          {data.sellIn !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 font-medium">Sell-In</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(data.sellIn)}
                </span>
              </div>
            </div>
          )}
          
          {/* Sell-Out */}
          {data.sellOut !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 font-medium">Sell-Out</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(data.sellOut)}
                </span>
              </div>
            </div>
          )}
          
          {/* Marge */}
          {data.marge !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 font-medium">Marge</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(data.marge)}
                </span>
              </div>
            </div>
          )}
          
          {/* Stock */}
          {data.stock !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 font-medium">Stock</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(data.stock)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function EvolutionChart({ data, mode, loading, error }: EvolutionChartProps) {
  const [visibleLines, setVisibleLines] = useState({
    sellIn: true,
    sellOut: true,
    marge: true,
    stock: true
  });

  // Transformation des données pour Recharts
  const chartData = useMemo(() => {
    if (!data) return [];
    
    return data.map(point => ({
      ...point,
      // Conversion pour éviter les problèmes de rendu
      sellIn: point.sellIn !== null ? point.sellIn / 1000 : null,
      sellOut: point.sellOut !== null ? point.sellOut / 1000 : null,
      marge: point.marge !== null ? point.marge / 1000 : null,
      stock: point.stock !== null ? point.stock / 1000 : null
    }));
  }, [data]);

  const handleLegendClick = (dataKey: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev]
    }));
  };

  // État de chargement
  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Pas de données
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const CustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mb-4">
      <button
        onClick={() => handleLegendClick('sellIn')}
        className={`flex items-center space-x-2 px-3 py-1 rounded transition-all ${
          visibleLines.sellIn 
            ? 'opacity-100 bg-blue-50 border border-blue-200' 
            : 'opacity-50 bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="w-3 h-0.5 bg-blue-500"></div>
        <span className="text-xs font-medium text-gray-700">Sell-In</span>
      </button>
      
      <button
        onClick={() => handleLegendClick('sellOut')}
        className={`flex items-center space-x-2 px-3 py-1 rounded transition-all ${
          visibleLines.sellOut 
            ? 'opacity-100 bg-green-50 border border-green-200' 
            : 'opacity-50 bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="w-3 h-0.5 bg-green-500"></div>
        <span className="text-xs font-medium text-gray-700">Sell-Out</span>
      </button>
      
      <button
        onClick={() => handleLegendClick('marge')}
        className={`flex items-center space-x-2 px-3 py-1 rounded transition-all ${
          visibleLines.marge 
            ? 'opacity-100 bg-orange-50 border border-orange-200' 
            : 'opacity-50 bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="w-3 h-0.5 bg-orange-500"></div>
        <span className="text-xs font-medium text-gray-700">Marge</span>
      </button>
      
      <button
        onClick={() => handleLegendClick('stock')}
        className={`flex items-center space-x-2 px-3 py-1 rounded transition-all ${
          visibleLines.stock 
            ? 'opacity-100 bg-purple-50 border border-purple-200' 
            : 'opacity-50 bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="w-3 h-0.5 bg-purple-500"></div>
        <span className="text-xs font-medium text-gray-700">Stock</span>
      </button>
    </div>
  );

  return (
    <div className="w-full h-80">
      <CustomLegend />
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="sellIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="sellOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="marge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="stock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            angle={mode === 'monthly' && chartData.length > 12 ? -45 : 0}
            textAnchor={mode === 'monthly' && chartData.length > 12 ? 'end' : 'middle'}
            height={mode === 'monthly' && chartData.length > 12 ? 60 : 30}
          />
          <YAxis 
            tickFormatter={(value) => `${value}K €`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip mode={mode} />} />
          
          {/* Sell-In */}
          {visibleLines.sellIn && (
            <Line
              type="monotone"
              dataKey="sellIn"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
              connectNulls={false}
            />
          )}
          
          {/* Sell-Out */}
          {visibleLines.sellOut && (
            <Line
              type="monotone"
              dataKey="sellOut"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6, fill: '#10b981' }}
              connectNulls={false}
            />
          )}
          
          {/* Marge */}
          {visibleLines.marge && (
            <Line
              type="monotone"
              dataKey="marge"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f97316' }}
              activeDot={{ r: 6, fill: '#f97316' }}
              connectNulls={false}
            />
          )}
          
          {/* Stock */}
          {visibleLines.stock && (
            <Line
              type="monotone"
              dataKey="stock"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: 4, fill: '#a855f7' }}
              activeDot={{ r: 6, fill: '#a855f7' }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}