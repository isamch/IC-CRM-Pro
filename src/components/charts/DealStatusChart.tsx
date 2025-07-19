import React from 'react';
import { Card } from '../ui/Card';

interface DealStatusChartProps {
  data: {
    pending: number;
    won: number;
    lost: number;
  };
}

export const DealStatusChart: React.FC<DealStatusChartProps> = ({ data }) => {
  const total = data.pending + data.won + data.lost;
  
  const getPercentage = (value: number) => total > 0 ? Math.round((value / total) * 100) : 0;
  
  const pendingPercentage = getPercentage(data.pending);
  const wonPercentage = getPercentage(data.won);
  const lostPercentage = getPercentage(data.lost);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Deal Status Distribution
      </h3>
      
      {/* Bar Chart */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.pending} ({pendingPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pendingPercentage}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Won</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.won} ({wonPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${wonPercentage}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Lost</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.lost} ({lostPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${lostPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Deals</div>
        </div>
      </div>
    </Card>
  );
};