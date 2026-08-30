
import React from 'react';
import { HardwareProfile } from '../types';
import { HARDWARE_PROFILES } from '../constants';

interface HardwareProfilerProps {
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  isDarkMode?: boolean;
}

const HardwareProfiler: React.FC<HardwareProfilerProps> = ({ selectedProfileId, onProfileChange, isDarkMode = true }) => {
  const selectedProfile = HARDWARE_PROFILES.find(p => p.id === selectedProfileId) || HARDWARE_PROFILES[0];
  
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const labelColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const selectBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const selectBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const focusRingColor = 'focus:ring-blue-500';

  return (
    <div className={`p-4 rounded-lg shadow-md mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Hardware Profile</h3>
      <label htmlFor="hardware-profile" className={`block text-sm font-medium ${labelColor} mb-1`}>Select Profile:</label>
      <select
        id="hardware-profile"
        value={selectedProfileId}
        onChange={(e) => onProfileChange(e.target.value)}
        className={`w-full p-2 ${selectBg} ${textColor} border ${selectBorder} rounded-md shadow-sm focus:outline-none ${focusRingColor} focus:border-blue-500 text-sm`}
      >
        {HARDWARE_PROFILES.map(profile => (
          <option key={profile.id} value={profile.id}>{profile.name}</option>
        ))}
      </select>
      <div className={`mt-3 text-xs ${labelColor}`}>
        <p className="font-semibold">Selected Specs:</p>
        <p>{selectedProfile.specs}</p>
      </div>
    </div>
  );
};

export default HardwareProfiler;