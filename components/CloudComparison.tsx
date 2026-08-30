
import React from 'react';
import { CLOUD_PERFORMANCE_TARGETS } from '../constants';

interface CloudComparisonProps {
  isDarkMode?: boolean;
}

const CloudComparison: React.FC<CloudComparisonProps> = ({ isDarkMode = true }) => {
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const valueColor = isDarkMode ? 'text-blue-400' : 'text-blue-600';
  
  return (
    <div className={`p-4 rounded-lg shadow-md mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-3 ${valueColor}`}>Cloud Performance Benchmarks (Claimed)</h3>
      <ul className="space-y-1 text-sm">
        {Object.entries(CLOUD_PERFORMANCE_TARGETS).map(([key, value]) => (
          <li key={key} className={textColor}>
            <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
            <span className={valueColor}>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CloudComparison;