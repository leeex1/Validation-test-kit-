import React from 'react';
import { FormulaDefinition, FormulaResultData } from '../types';
import { 
  X, 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Gauge,
  Activity,
  FileText
} from 'lucide-react';

interface FormulaDossierModalProps {
  formula: FormulaDefinition | null;
  resultData?: FormulaResultData;
  onClose: () => void;
}

const FormulaDossierModal: React.FC<FormulaDossierModalProps> = ({
  formula,
  resultData,
  onClose
}) => {
  if (!formula) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-gray-900 border border-gray-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded border ${
              formula.suite === 'quillan'
                ? 'bg-purple-900/40 text-purple-300 border-purple-700/60'
                : 'bg-cyan-900/40 text-cyan-300 border-cyan-700/60'
            }`}>
              {formula.key || formula.id}
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                {formula.name}
              </h2>
              <span className="text-xs text-gray-400">
                {formula.suite === 'quillan' ? 'Quillan AGI Mathematical Engine' : formula.suite === 'foundation' ? 'Foundation Canonical Ledger' : 'NextVerse Min-Maxed Engine'} • {formula.category || 'Core'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          {/* Concept & Derivation Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-950/50 border border-gray-800">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Theoretical Concept</span>
              </div>
              <p className="text-gray-200 leading-relaxed">{formula.concept}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-950/50 border border-gray-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
                <Layers className="w-4 h-4" />
                <span>Derivation Foundation</span>
              </div>
              <p className="text-gray-200 leading-relaxed">{formula.derivationBase || 'Quantum Information & Classical Complexity Theory'}</p>
            </div>
          </div>

          {/* Mathematical Formulation (LaTeX display) */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Mathematical Equation (LaTeX / ASCII)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                Rigorous Form
              </span>
            </div>
            
            <div className="p-4 rounded-lg bg-black/60 border border-gray-800 font-mono text-center text-base sm:text-lg text-emerald-300 overflow-x-auto">
              {formula.formulaLatex || formula.formulaString}
            </div>

            {formula.formulaLatex && (
              <div className="mt-2 text-xs text-gray-500 font-mono text-center">
                Notation: {formula.formulaString}
              </div>
            )}
          </div>

          {/* Inputs & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-950/50 border border-gray-800">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-2">
                Input Variables:
              </span>
              {formula.inputs && formula.inputs.length > 0 ? (
                <ul className="space-y-1.5">
                  {formula.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-amber-400 font-mono">•</span>
                      <code className="text-amber-200/90 font-mono">{inp}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">Standard parameterized model inputs.</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-gray-950/50 border border-gray-800">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                Boundary Constraints:
              </span>
              {formula.constraints && formula.constraints.length > 0 ? (
                <ul className="space-y-1.5">
                  {formula.constraints.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="font-mono text-emerald-200/90">{c}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">Unbounded standard convex domain.</p>
              )}
            </div>
          </div>

          {/* Functional Application & Architectural Layer */}
          <div className="p-4 rounded-xl bg-gray-950/50 border border-gray-800">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2">
              Functional Application & Architectural Mapping:
            </span>
            <p className="text-gray-300 leading-relaxed">{formula.functionalApplication}</p>
            {formula.layer && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-800/60 text-xs text-blue-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>Brain / Cortex Mapping: <strong>{formula.layer}</strong></span>
              </div>
            )}
          </div>

          {/* Active Live Result & Target Metric */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 block">Target Benchmark</span>
                <span className="text-base font-bold text-gray-100">{formula.targetValue}</span>
                <span className="text-xs text-gray-500 block mt-0.5">Metric: {formula.targetMetric}</span>
              </div>

              {resultData && (
                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 block">Latest Live Run Result</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {resultData.primaryResult.toLocaleString(undefined, { maximumFractionDigits: 4 })} {formula.primaryUnit || ''}
                  </span>
                  <span className="text-xs text-emerald-500 block">
                    Execution Time: {resultData.executionTimeMs?.toFixed(2)} ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-sm transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulaDossierModal;
