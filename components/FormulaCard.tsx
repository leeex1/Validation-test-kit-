import React from 'react';
import { FormulaState, SimulatedLoad } from '../types';
import ParameterInput from './ParameterInput';
import { 
  Play, 
  Layers, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface FormulaCardProps {
  formula: FormulaState;
  onParameterChange: (formulaId: string, paramId: string, value: number) => void;
  onRunTest: (formulaId: string) => void;
  onOpenDossier?: (formulaId: string) => void;
  isDarkMode?: boolean;
  dependencies?: Record<string, number | undefined>;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ 
  formula, 
  onParameterChange, 
  onRunTest, 
  onOpenDossier,
  isDarkMode = true 
}) => {
  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const subtextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const isQuillan = formula.suite === 'quillan';

  const getLoadColor = (loadLevel: SimulatedLoad['cpu'] | undefined): string => {
    switch (loadLevel) {
      case 'Low': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'Medium': return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'High': return 'text-orange-400 bg-orange-950/40 border-orange-800/60';
      case 'Very High': return 'text-red-400 bg-red-950/40 border-red-800/60';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl border ${cardBg} transition-all duration-200 hover:border-gray-700 flex flex-col justify-between`}>
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg border ${
              isQuillan 
                ? 'bg-purple-950/60 text-purple-300 border-purple-800/80' 
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80'
            }`}>
              {formula.key || formula.id}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-800/90 text-gray-300 border border-gray-700">
              #{formula.numId || '1'}
            </span>
            {formula.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/50">
                {formula.category}
              </span>
            )}
          </div>

          {onOpenDossier && (
            <button
              onClick={() => onOpenDossier(formula.id)}
              className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-gray-800"
              title="Inspect Complete Theoretical Dossier"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Theory Dossier</span>
            </button>
          )}
        </div>

        {/* Title & Concept */}
        <h3 className="text-xl font-bold text-gray-100 mb-1 leading-snug">
          {formula.name}
        </h3>
        <p className={`text-xs ${subtextColor} mb-3 leading-relaxed`}>
          {formula.concept || formula.description}
        </p>

        {/* Formula Math Box */}
        <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800/90 font-mono text-xs text-emerald-300 mb-4 overflow-x-auto">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Equation:</div>
          <div className="font-semibold text-emerald-200">
            {formula.formulaLatex || formula.formulaString}
          </div>
        </div>

        {/* Layer Mapping Tag */}
        {formula.layer && (
          <div className="mb-4 text-[11px] text-gray-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Layer: <strong className="text-gray-300">{formula.layer}</strong></span>
          </div>
        )}

        {/* Interactive Parameter Controls */}
        <div className="space-y-3 mb-5 pt-2 border-t border-gray-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Parameters:
          </div>
          <div className="grid grid-cols-1 gap-2">
            {formula.parameters.map((param) => (
              <ParameterInput
                key={param.id}
                parameter={param}
                value={formula.currentParams[param.id] ?? param.defaultValue}
                onChange={(value) => onParameterChange(formula.id, param.id, value)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Execution and Results Section */}
      <div>
        <button
          onClick={() => onRunTest(formula.id)}
          disabled={formula.isRunning}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            formula.isRunning
              ? 'bg-gray-800 text-gray-400 cursor-wait'
              : isQuillan
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-900/30'
          }`}
        >
          {formula.isRunning ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Computing Solution...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Evaluate {formula.key || formula.id}</span>
            </>
          )}
        </button>

        {/* Results Box */}
        {formula.result && (
          <div className="mt-4 p-4 rounded-xl bg-gray-950/80 border border-gray-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Evaluation Output:</span>
              <span className="text-[11px] font-mono text-gray-400">
                {formula.result.executionTimeMs?.toFixed(2)} ms
              </span>
            </div>

            {/* Primary Value */}
            <div className="p-3 rounded-lg bg-gray-900/90 border border-gray-800/80 flex items-baseline justify-between mb-2">
              <span className="text-xs text-gray-400">Primary Value:</span>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {typeof formula.result.primaryResult === 'number'
                    ? formula.result.primaryResult >= 10000
                      ? formula.result.primaryResult.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : formula.result.primaryResult.toFixed(4)
                    : formula.result.primaryResult}
                </span>
                <span className="text-xs text-gray-400 ml-1.5">{formula.primaryUnit}</span>
              </div>
            </div>

            {/* Speedup factor if applicable */}
            {formula.result.speedupFactor !== undefined && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-800/60">
                <span className="text-gray-400">Speedup / Efficiency:</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {formula.result.speedupFactor.toFixed(2)}x
                </span>
              </div>
            )}

            {/* Status Message */}
            {formula.result.statusMessage && (
              <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{formula.result.statusMessage}</span>
              </div>
            )}

            {/* Secondary Metrics */}
            {formula.result.secondaryMetrics && Object.keys(formula.result.secondaryMetrics).length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-800 space-y-1">
                {Object.entries(formula.result.secondaryMetrics).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{key}:</span>
                    <span className="font-mono text-gray-200 font-medium">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Simulated Load Estimate */}
            {formula.result.simulatedLoad && (
              <div className="mt-3 pt-2 border-t border-gray-800">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>Hardware Load:</span>
                  {formula.result.simulatedLoad.thermodynamic !== undefined && (
                    <span className="text-orange-400 flex items-center gap-1 font-mono">
                      <Flame className="w-3 h-3" />
                      {formula.result.simulatedLoad.thermodynamic}% Thermo
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                  <div className={`py-1 px-1.5 rounded border font-mono ${getLoadColor(formula.result.simulatedLoad.cpu)}`}>
                    CPU: {formula.result.simulatedLoad.cpu}
                  </div>
                  <div className={`py-1 px-1.5 rounded border font-mono ${getLoadColor(formula.result.simulatedLoad.gpu)}`}>
                    GPU: {formula.result.simulatedLoad.gpu}
                  </div>
                  <div className={`py-1 px-1.5 rounded border font-mono ${getLoadColor(formula.result.simulatedLoad.ram)}`}>
                    RAM: {formula.result.simulatedLoad.ram}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaCard;
