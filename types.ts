export interface FormulaParameter {
  id: string;
  name: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  isInteger?: boolean;
  description?: string;
}

export interface SimulatedLoad {
  cpu: 'Low' | 'Medium' | 'High' | 'Very High';
  gpu: 'Low' | 'Medium' | 'High' | 'Very High';
  ram: 'Low' | 'Medium' | 'High' | 'Very High';
  thermodynamic?: number; // E_ICE load indicator 0 - 100%
}

export type FormulaSuite = 'quillan' | 'nextverse';

export interface FormulaDefinition {
  id: string;
  numId?: number;
  key: string;
  suite: FormulaSuite;
  name: string;
  concept: string;
  derivationBase: string;
  formulaLatex: string;
  formulaString: string;
  inputs: string[];
  constraints?: string[];
  functionalApplication: string;
  category: string;
  layer?: string;
  parameters: FormulaParameter[];
  calculation: (
    params: Record<string, number>,
    dependencies?: Record<string, any>
  ) => FormulaCalculationResult;
  targetMetric: string;
  targetValue: string;
  localTargetValue: string;
  validationMethod: string;
  primaryUnit: string;
  baselineKey?: string;
  notes?: string;
}

export interface FormulaCalculationResult {
  primaryResult: number;
  speedupFactor?: number;
  error?: string;
  secondaryMetrics?: Record<string, string | number>;
  statusMessage?: string;
  simulatedLoadEstimate?: SimulatedLoad;
}

export interface FormulaState extends FormulaDefinition {
  currentParams: Record<string, number>;
  result?: FormulaResultData;
  isRunning?: boolean;
}

export interface FormulaResultData extends FormulaCalculationResult {
  measuredPerformance?: number;
  executionTimeMs: number;
  simulatedLoad?: SimulatedLoad;
}

export interface HardwareProfile {
  id: string;
  name: string;
  specs: string;
  cpuMultiplier: number;
  gpuMultiplier: number;
  ramFactor: number;
  baselineValues: Record<string, number>;
}

export interface AllFormulaResults {
  [key: string]: FormulaResultData | undefined;
}

export interface AllFormulaParameters {
  [key: string]: Record<string, number>;
}

export interface VmInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused' | 'unknown' | string;
  cpu_cores?: number | null;
  memory_gb?: number | null;
  can_boost: boolean;
  is_boosting?: boolean;
  boost_status?: string;
}

export interface CompoundTurboMetrics {
  quantumCoreBoost: number;
  vmReplicationGain: number;
  aiAgentFeedback: number;
  renderThroughput: number;
  networkLatencyMs: number;
  ethicalCompliancePct: number;
  overallSynergyFactor: number;
  activeAvatarsCount: number;
}
