
import React from 'react';
import { VmInfo } from '../types';

interface VmBoosterProps {
  vms: VmInfo[];
  onBoostVm: (vmId: string) => void;
  onRefreshVms: () => void;
  isLoading: boolean;
  isDarkMode?: boolean;
}

const VmBooster: React.FC<VmBoosterProps> = ({ vms, onBoostVm, onRefreshVms, isLoading, isDarkMode = true }) => {
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const accentTextColor = isDarkMode ? 'text-teal-400' : 'text-teal-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const buttonBg = isDarkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600';
  const buttonDisabledBg = isDarkMode ? 'bg-gray-600' : 'bg-gray-400';
  const itemBg = isDarkMode ? 'bg-gray-750' : 'bg-gray-50';

  return (
    <div className={`p-6 rounded-lg shadow-xl border ${borderColor} ${cardBg} mb-8`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-2xl font-bold ${accentTextColor}`}>Connected Virtual Machines</h3>
        <button
          onClick={onRefreshVms}
          disabled={isLoading}
          className={`px-4 py-2 text-sm text-white font-semibold rounded-md transition-colors duration-150 ${isLoading ? buttonDisabledBg : buttonBg}`}
          aria-label="Refresh VM list"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      
      {isLoading && !vms.length && <p className={textColor}>Loading VM data...</p>}
      {!isLoading && vms.length === 0 && !isLoading && <p className={textColor}>No VMs found or backend not reachable. Ensure the Python backend is running and accessible at the configured URL.</p>}

      {vms.length > 0 && (
        <div className="space-y-4">
          {vms.map(vm => (
            <div key={vm.id} className={`p-4 rounded-md border ${borderColor} ${itemBg} shadow`}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>{vm.name}</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID: {vm.id}</p>
                </div>
                <div className={`text-sm ${textColor} mt-2 sm:mt-0`}>
                  Status: <span className={`font-semibold ${vm.status === 'running' ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')}`}>{vm.status}</span>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-2 mt-3 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>CPU Cores: <span className="font-semibold">{vm.cpu_cores ?? 'N/A'}</span></p>
                <p>Memory: <span className="font-semibold">{vm.memory_gb ?? 'N/A'} GB</span></p>
              </div>
              {vm.boost_status && (
                <p className={`mt-2 text-xs font-medium ${vm.boost_status && vm.boost_status.toLowerCase().includes('error') ? (isDarkMode ? 'text-red-400' : 'text-red-600') : (isDarkMode ? 'text-blue-300' : 'text-blue-700')}`}>Boost Info: {vm.boost_status}</p>
              )}
              <div className="mt-3">
                <button
                  onClick={() => onBoostVm(vm.id)}
                  disabled={!vm.can_boost || vm.is_boosting || vm.status !== 'running'}
                  className={`w-full sm:w-auto px-4 py-2 text-sm text-white font-semibold rounded-md transition-colors duration-150 
                    ${(!vm.can_boost || vm.is_boosting || vm.status !== 'running') ? buttonDisabledBg : buttonBg}`}
                  aria-label={`Boost VM ${vm.name}`}
                >
                  {vm.is_boosting ? (
                     <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Boosting...
                    </div>
                  ) : 'Boost VM'}
                </button>
                {!vm.can_boost && vm.status === 'running' && <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Boosting not available for this VM.</p>}
                {vm.status !== 'running' && <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>VM must be running to boost.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
       <p className={`mt-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        <strong>Note:</strong> This module interacts with a Python backend. The "Boost VM" functionality
        depends on the backend's implementation for your specific VM environment.
        The backend is responsible for the actual VM control logic. Ensure it's running and accessible.
      </p>
    </div>
  );
};

export default VmBooster;
