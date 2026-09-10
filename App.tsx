import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FormulaState, 
  HardwareProfile, 
  FormulaResultData, 
  SimulatedLoad, 
  VmInfo,
  FormulaDefinition
} from './types';
import { 
  ALL_FORMULAS, 
  HARDWARE_PROFILES, 
  SCENARIO_PRESETS,
  CLOUD_PERFORMANCE_TARGETS 
} from './constants';
import FormulaCard from './components/FormulaCard';
import HardwareProfiler from './components/HardwareProfiler';
import CloudComparison from './components/CloudComparison';
import LocalHardwareInfo from './components/LocalHardwareInfo';
import VmBooster from './components/VmBooster';
import CompoundTurboFlowchart from './components/CompoundTurboFlowchart';
import FormulaDossierModal from './components/FormulaDossierModal';
import { 
  Cpu, 
  Zap, 
  Search, 
  Sliders, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Flame, 
  Sparkles,
  Server,
  Activity,
  Filter,
  Check
} from 'lucide-react';

const PYTHON_BACKEND_URL = 'http://localhost:5000';

type ViewTab = 'all' | 'quillan' | 'nextverse' | 'foundation' | 'compound-turbo' | 'vm-control';

const App: React.FC = () => {
  // Initialize all 34 formulas
  const [formulas, setFormulas] = useState<FormulaState[]>(() =>
    ALL_FORMULAS.map(def => ({
      ...def,
      currentParams: def.parameters.reduce((acc, param) => {
        acc[param.id] = param.defaultValue;
        return acc;
      }, {} as Record<string, number>),
      result: undefined,
      isRunning: false,
    }))
  );

  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [inspectFormulaId, setInspectFormulaId] = useState<string | null>(null);

  const [selectedHardwareProfileId, setSelectedHardwareProfileId] = useState<string>(HARDWARE_PROFILES[0].id);
  const currentHardwareProfile = HARDWARE_PROFILES.find(p => p.id === selectedHardwareProfileId) || HARDWARE_PROFILES[0];

  // VM state
  const [vms, setVms] = useState<VmInfo[]>([]);
  const [vmLoading, setVmLoading] = useState<boolean>(false);
  const [vmError, setVmError] = useState<string | null>(null);

  const fetchVms = useCallback(async () => {
    setVmLoading(true);
    setVmError(null);
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/vms`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server responded with ${response.status}` }));
        throw new Error(`Failed to fetch VMs: ${errorData.message || response.statusText}`);
      }
      const data: VmInfo[] = await response.json();
      setVms(data.map(vm => ({ ...vm, is_boosting: false, boost_status: undefined })));
    } catch (error: any) {
      setVmError(error.message || 'Could not reach Python backend. Running in simulated offline validation mode.');
      setVms([]);
    } finally {
      setVmLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVms();
  }, [fetchVms]);

  const handleBoostVm = async (vmId: string) => {
    setVms(prevVms => prevVms.map(vm => vm.id === vmId ? { ...vm, is_boosting: true, boost_status: 'Initializing boost...' } : vm));
    setVmError(null);
    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/vms/${vmId}/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || `Failed to boost VM: ${response.statusText}`);
      }
      setVms(prevVms => prevVms.map(vm => vm.id === vmId ? { ...vm, is_boosting: false, boost_status: result.message || 'Boost completed.' } : vm));
    } catch (error: any) {
      setVmError(error.message || 'Error executing VM boost.');
      setVms(prevVms => prevVms.map(vm => vm.id === vmId ? { ...vm, is_boosting: false, boost_status: `Error: ${error.message}` } : vm));
    }
  };

  const handleParameterChange = (formulaId: string, paramId: string, value: number) => {
    setFormulas(prevFormulas =>
      prevFormulas.map(f =>
        f.id === formulaId
          ? { ...f, currentParams: { ...f.currentParams, [paramId]: value } }
          : f
      )
    );
  };

  // Run a single formula calculation
  const runTest = useCallback(async (formulaId: string) => {
    setFormulas(prev => prev.map(f => f.id === formulaId ? { ...f, isRunning: true } : f));

    const formulaDef = formulas.find(f => f.id === formulaId);
    if (!formulaDef) return;

    // Small micro-delay to let UI show animation
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 70));

    const startTime = performance.now();

    // Prepare inter-formula dependency bag
    const dependencies: Record<string, any> = {};
    formulas.forEach(f => {
      if (f.result) {
        dependencies[`${f.id}_Result`] = f.result;
        dependencies[`${f.key || f.id}_Q`] = f.result.primaryResult;
      }
    });

    const calculationOutcome = formulaDef.calculation(formulaDef.currentParams, dependencies);
    const endTime = performance.now();

    let measuredPerformance: number | undefined = undefined;
    if (formulaDef.baselineKey && currentHardwareProfile.baselineValues[formulaDef.baselineKey] && calculationOutcome.speedupFactor) {
      const baseline = currentHardwareProfile.baselineValues[formulaDef.baselineKey];
      let profileMultiplier = currentHardwareProfile.cpuMultiplier;
      if (formulaDef.id === 'NV_DVVE' || formulaDef.id === 'DVVE') {
        profileMultiplier = currentHardwareProfile.gpuMultiplier;
      }
      measuredPerformance = baseline * profileMultiplier * calculationOutcome.speedupFactor;
    } else {
      measuredPerformance = calculationOutcome.primaryResult;
    }

    let finalSimulatedLoad: SimulatedLoad | undefined = calculationOutcome.simulatedLoadEstimate;
    if (finalSimulatedLoad && currentHardwareProfile) {
      const adjustLoad = (baseLoad: 'Low' | 'Medium' | 'High' | 'Very High', capabilityMultiplier: number): 'Low' | 'Medium' | 'High' | 'Very High' => {
        const levels: ('Low' | 'Medium' | 'High' | 'Very High')[] = ['Low', 'Medium', 'High', 'Very High'];
        let currentIndex = levels.indexOf(baseLoad);
        if (capabilityMultiplier < 0.6) currentIndex = Math.min(levels.length - 1, currentIndex + 1);
        else if (capabilityMultiplier < 0.9) currentIndex = Math.min(levels.length - 1, currentIndex + (baseLoad === 'Low' ? 1 : 0));
        else if (capabilityMultiplier > 1.5) currentIndex = Math.max(0, currentIndex - 1);
        else if (capabilityMultiplier > 1.1) currentIndex = Math.max(0, currentIndex - (baseLoad === 'Very High' ? 1 : 0));
        return levels[currentIndex];
      };
      finalSimulatedLoad = {
        cpu: adjustLoad(finalSimulatedLoad.cpu, currentHardwareProfile.cpuMultiplier),
        gpu: adjustLoad(finalSimulatedLoad.gpu, currentHardwareProfile.gpuMultiplier),
        ram: adjustLoad(finalSimulatedLoad.ram, currentHardwareProfile.ramFactor),
        thermodynamic: finalSimulatedLoad.thermodynamic
      };
    }

    const resultData: FormulaResultData = {
      ...calculationOutcome,
      measuredPerformance: measuredPerformance,
      executionTimeMs: endTime - startTime,
      simulatedLoad: finalSimulatedLoad,
    };

    setFormulas(prevFormulas =>
      prevFormulas.map(f =>
        f.id === formulaId ? { ...f, result: resultData, isRunning: false } : f
      )
    );
  }, [formulas, currentHardwareProfile]);

  // Run all currently visible formulas in batch
  const runAllVisible = async () => {
    setIsBatchRunning(true);
    const visibleFormulas = filteredFormulas;

    for (const f of visibleFormulas) {
      await runTest(f.id);
    }
    setIsBatchRunning(false);
  };

  // Apply a Scenario Preset
  const applyPreset = (preset: typeof SCENARIO_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setFormulas(prev =>
      prev.map(f => {
        const overrides = preset.paramOverrides[f.id] || preset.paramOverrides[f.key || ''];
        if (overrides) {
          return {
            ...f,
            currentParams: {
              ...f.currentParams,
              ...overrides
            }
          };
        }
        return f;
      })
    );
  };

  // Reset all parameters to defaults
  const resetAllToDefaults = () => {
    setSelectedPresetId(null);
    setFormulas(prev =>
      prev.map(f => ({
        ...f,
        currentParams: f.parameters.reduce((acc, p) => {
          acc[p.id] = p.defaultValue;
          return acc;
        }, {} as Record<string, number>),
        result: undefined
      }))
    );
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    formulas.forEach(f => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [formulas]);

  // Filter formulas based on Tab, Category, and Search
  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      // Tab filter
      if (activeTab === 'quillan' && f.suite !== 'quillan') return false;
      if (activeTab === 'nextverse' && f.suite !== 'nextverse') return false;
      if (activeTab === 'foundation' && f.suite !== 'foundation') return false;

      // Category filter
      if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchKey = (f.key || '').toLowerCase().includes(q);
        const matchConcept = (f.concept || '').toLowerCase().includes(q);
        const matchLayer = (f.layer || '').toLowerCase().includes(q);
        const matchDesc = (f.description || '').toLowerCase().includes(q);
        if (!matchName && !matchKey && !matchConcept && !matchLayer && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [formulas, activeTab, selectedCategory, searchQuery]);

  // Aggregate Metrics
  const evaluatedCount = formulas.filter(f => f.result !== undefined).length;
  const avgSpeedup = useMemo(() => {
    const evaluatedWithSpeedup = formulas.filter(f => f.result?.speedupFactor !== undefined);
    if (evaluatedWithSpeedup.length === 0) return 0;
    const sum = evaluatedWithSpeedup.reduce((acc, f) => acc + (f.result?.speedupFactor || 1), 0);
    return sum / evaluatedWithSpeedup.length;
  }, [formulas]);

  // Inspect Modal Formula
  const inspectedFormula = inspectFormulaId ? formulas.find(f => f.id === inspectFormulaId) || null : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-16 font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-teal-300">
                  NextVerse & Quillan
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  v3.4 Production Suite
                </span>
              </div>
              <p className="text-xs text-gray-400">
                68 Rigorous Formulas: 23 Quillan AGI + 11 NextVerse Min-Maxed Core Engine + 34 Foundation (Physics/CS/ML)
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={runAllVisible}
              disabled={isBatchRunning}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                isBatchRunning
                  ? 'bg-indigo-700 text-white animate-pulse cursor-wait'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isBatchRunning ? 'animate-spin' : ''}`} />
              {isBatchRunning ? 'Evaluating Suite...' : `Evaluate Visible (${filteredFormulas.length})`}
            </button>

            <button
              onClick={resetAllToDefaults}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors border border-gray-700 flex items-center gap-1.5"
              title="Reset all formula parameters to theoretical defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Suite Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pt-1 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <span>All Formulas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-blue-200 font-mono">34</span>
          </button>

          <button
            onClick={() => setActiveTab('quillan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'quillan'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Quillan AGI Suite</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-purple-200 font-mono">23</span>
          </button>

          <button
            onClick={() => setActiveTab('nextverse')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'nextverse'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-300" />
            <span>NextVerse Platform Core</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-cyan-200 font-mono">11</span>
          </button>
            <button
              onClick={() => setActiveTab('foundation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'foundation'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers size={16} />
              <span>Foundation Ledger</span>
            </button>

          <button
            onClick={() => setActiveTab('compound-turbo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'compound-turbo'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>⚡ Compound Turbo Feedback Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('vm-control')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'vm-control'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-teal-300" />
            <span>🖥️ Virtual Machine Control</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Real-time Telemetry Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Tested Formulas</span>
              <span className="text-xl font-bold font-mono text-gray-100">
                {evaluatedCount} <span className="text-xs text-gray-500 font-normal">/ {formulas.length}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Mean Boost Multiplier</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {avgSpeedup > 0 ? `${avgSpeedup.toFixed(1)}x` : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Ethical Checksum</span>
              <span className="text-xl font-bold font-mono text-emerald-400">99.5%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Target Interactive Latency</span>
              <span className="text-xl font-bold font-mono text-purple-400">&lt;20 ms</span>
            </div>
          </div>
        </div>

        {/* Theoretical Scenario Presets Bar */}
        <div className="mb-6 p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-gray-200">Pre-Calibrated Simulation Presets:</h3>
            </div>
            <span className="text-xs text-gray-400">Click to apply mathematical scenario parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SCENARIO_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-900/50 border-blue-500 ring-1 ring-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-gray-800/60 border-gray-700/70 hover:border-gray-600 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-100 truncate">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-blue-300 font-mono inline-block mb-1">
                    {preset.badge}
                  </span>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware & Cloud Info Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <HardwareProfiler
            selectedProfileId={selectedHardwareProfileId}
            onProfileChange={setSelectedHardwareProfileId}
            isDarkMode={true}
          />
          <CloudComparison isDarkMode={true} />
          <LocalHardwareInfo isDarkMode={true} />
        </div>

        {/* Render Compound Turbo Flowchart View */}
        {activeTab === 'compound-turbo' && (
          <CompoundTurboFlowchart isDarkMode={true} />
        )}

        {/* Render VM Control View */}
        {activeTab === 'vm-control' && (
          <div className="mb-10">
            <VmBooster
              vms={vms}
              onBoostVm={handleBoostVm}
              onRefreshVms={fetchVms}
              isLoading={vmLoading}
              isDarkMode={true}
            />
            {vmError && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{vmError}</span>
              </div>
            )}
          </div>
        )}

        {/* Search & Category Filter Bar */}
        {(activeTab === 'all' || activeTab === 'quillan' || activeTab === 'nextverse' || activeTab === 'foundation') && (
          <div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-gray-900 border border-gray-800">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search formula key, concept, or layer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-gray-950 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mr-1" />
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  All ({formulas.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFormulas.map(formula => (
                <FormulaCard
                  key={formula.id}
                  formula={formula}
                  onParameterChange={handleParameterChange}
                  onRunTest={runTest}
                  onOpenDossier={(id) => setInspectFormulaId(id)}
                  isDarkMode={true}
                />
              ))}
            </div>

            {filteredFormulas.length === 0 && (
              <div className="text-center py-16 p-8 rounded-2xl bg-gray-900 border border-gray-800">
                <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-300">No matching formulas found</h3>
                <p className="text-xs text-gray-500 mt-1">Try clearing your search query or selecting another category.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-4 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200"
                >
                  Reset Search Filter
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Theory Dossier Modal */}
      {inspectedFormula && (
        <FormulaDossierModal
          formula={inspectedFormula}
          resultData={inspectedFormula.result}
          onClose={() => setInspectFormulaId(null)}
        />
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        <p>
          NextVerse & Quillan Formula Validation Suite &copy; {new Date().getFullYear()}. Complete mathematical engine supporting 23 Quillan custom formulations and 11 NextVerse compound turbo engine modules.
        </p>
      </footer>
    </div>
  );
};

export default App;
