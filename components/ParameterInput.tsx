
import React from 'react';
import { FormulaParameter } from '../types';

interface ParameterInputProps {
  parameter: FormulaParameter;
  value: number;
  onChange: (value: number) => void;
  isDarkMode?: boolean;
}

const ParameterInput: React.FC<ParameterInputProps> = ({ parameter, value, onChange, isDarkMode = true }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = parameter.isInteger ? parseInt(e.target.value) : parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const labelColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const bgColor = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const focusRingColor = 'focus:ring-blue-500';

  return (
    <div className="mb-3">
      <label htmlFor={parameter.id} className={`block text-sm font-medium ${labelColor} mb-1`}>
        {parameter.name} {parameter.unit ? `(${parameter.unit})` : ''}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          id={`${parameter.id}-slider`}
          name={`${parameter.id}-slider`}
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          value={value}
          onChange={handleChange}
          className="w-2/3 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <input
          type="number"
          id={parameter.id}
          name={parameter.id}
          value={value}
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          onChange={handleChange}
          className={`w-1/3 p-2 ${bgColor} ${textColor} border ${borderColor} rounded-md shadow-sm focus:outline-none ${focusRingColor} focus:border-blue-500 text-sm`}
        />
      </div>
    </div>
  );
};

export default ParameterInput;