
import React, { useEffect, useState } from 'react';

interface LocalHardwareInfoProps {
  isDarkMode?: boolean;
}

const LocalHardwareInfo: React.FC<LocalHardwareInfoProps> = ({ isDarkMode = true }) => {
  const [hardwareConcurrency, setHardwareConcurrency] = useState<number | string>('N/A');
  const [deviceMemory, setDeviceMemory] = useState<number | string>('N/A');

  useEffect(() => {
    if (navigator.hardwareConcurrency) {
      setHardwareConcurrency(navigator.hardwareConcurrency);
    }
    // TS
    if ('deviceMemory' in navigator && typeof (navigator as any).deviceMemory === 'number') {
      setDeviceMemory((navigator as any).deviceMemory);
    }
  }, []);

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const valueColor = isDarkMode ? 'text-blue-400' : 'text-blue-600';
  const noteColor = isDarkMode ? 'text-gray-500' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';


  return (
    <div className={`p-4 rounded-lg shadow-md ${cardBg} border ${borderColor}`}>
      <h3 className={`text-lg font-semibold mb-2 ${valueColor}`}>Local Hardware Info (Browser Reported)</h3>
      <div className="space-y-1 text-sm">
        <p className={textColor}>
          Logical CPU Cores: <span className={valueColor}>{hardwareConcurrency}</span>
        </p>
        <p className={textColor}>
          Approx. Device RAM (GB): <span className={valueColor}>{deviceMemory}</span>
        </p>
      </div>
      <p className={`mt-3 text-xs ${noteColor}`}>
        <strong>Note:</strong> These are static hardware characteristics reported by your browser. They are <strong>not</strong> real-time CPU/RAM usage, load, or detailed performance metrics. Web applications have limited access to OS-level hardware details for security reasons. The "Execution Time" for tests is the most direct measure of local computation speed for this app.
      </p>
    </div>
  );
};

export default LocalHardwareInfo;