import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  Layers, 
  Brain, 
  Activity, 
  RefreshCw, 
  ArrowRight, 
  Sparkles,
  Users,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface CompoundTurboFlowchartProps {
  isDarkMode?: boolean;
  onApplyAvatarBoost?: (boostMultiplier: number) => void;
}

const CompoundTurboFlowchart: React.FC<CompoundTurboFlowchartProps> = ({
  isDarkMode = true,
}) => {
  const [avatarCount, setAvatarCount] = useState<number>(3);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [feedbackPulse, setFeedbackPulse] = useState<boolean>(false);

  // Each avatar is a full copy of the VM/Computation Layer providing compound amplification
  const avatarBoostFactor = 1 + (avatarCount * 1.85);
  const quantumCoreOutput = 44058 * avatarBoostFactor;
  const vmReplicationOutput = quantumCoreOutput * 2.0;
  const compoundSynergy = (vmReplicationOutput * 1.25) / 1000;

  const triggerFeedbackLoop = () => {
    setFeedbackPulse(true);
    let step = 0;
    const interval = setInterval(() => {
      setActiveStep(step);
      step++;
      if (step > 5) {
        clearInterval(interval);
        setTimeout(() => {
          setActiveStep(null);
          setFeedbackPulse(false);
        }, 1200);
      }
    }, 450);
  };

  const steps = [
    {
      id: 0,
      title: '1. User Interactions / Commands',
      desc: 'Real-time user chat, inputs, and multi-modal command streams initiate task pipeline.',
      icon: Users,
      color: 'border-pink-500 text-pink-400 bg-pink-950/30',
      activeColor: 'ring-2 ring-pink-400 bg-pink-900/50 shadow-pink-500/50 shadow-lg',
      stat: 'Low Latency I/O'
    },
    {
      id: 1,
      title: '2. Game Engine & Digital Avatars',
      desc: `Each active avatar (${avatarCount} running) acts as a full VM instance replica (+${(avatarCount * 185).toFixed(0)}% amplification).`,
      icon: Users,
      color: 'border-blue-500 text-blue-400 bg-blue-950/30',
      activeColor: 'ring-2 ring-blue-400 bg-blue-900/50 shadow-blue-500/50 shadow-lg',
      stat: `${avatarBoostFactor.toFixed(2)}x Avatar Boost`
    },
    {
      id: 2,
      title: '3. AI Assistant Module (Prefrontal)',
      desc: 'Prefrontal reasoning module receives avatar processing power and reinforces core structure.',
      icon: Brain,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/30',
      activeColor: 'ring-2 ring-emerald-400 bg-emerald-900/50 shadow-emerald-500/50 shadow-lg',
      stat: '<80ms Reflex'
    },
    {
      id: 3,
      title: '4. Abstraction & Integration Layer',
      desc: 'Global workspace aggregates telemetry, verifies ethical checkpoints, and coordinates feedback.',
      icon: Layers,
      color: 'border-purple-500 text-purple-400 bg-purple-950/30',
      activeColor: 'ring-2 ring-purple-400 bg-purple-900/50 shadow-purple-500/50 shadow-lg',
      stat: '<25% System Drag'
    },
    {
      id: 4,
      title: '5. Quantum Super VM & Core (JQLD + LVVM)',
      desc: 'Base engine receives feedback, recalibrating Grover and Rowen efficiency factors for exponential power.',
      icon: Cpu,
      color: 'border-amber-500 text-amber-400 bg-amber-950/30',
      activeColor: 'ring-2 ring-amber-400 bg-amber-900/50 shadow-amber-500/50 shadow-lg',
      stat: `${(quantumCoreOutput / 1000).toFixed(1)}k Q-Units`
    },
    {
      id: 5,
      title: '6. Aggregated Infinite Feedback Loop',
      desc: 'Compounded power radiates backward into all lower layers, creating an exponential runway curve.',
      icon: Zap,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-950/30',
      activeColor: 'ring-2 ring-cyan-400 bg-cyan-900/50 shadow-cyan-500/50 shadow-lg',
      stat: `${compoundSynergy.toFixed(1)}x Compound Boost`
    }
  ];

  return (
    <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} shadow-2xl mb-10`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400">
              NextVerse Compound Turbo Feedback Loop
            </h3>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Layered multi-tiered amplification: Each layer mirrors and exponentially compounds performance onto higher and lower layers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerFeedbackLoop}
            disabled={feedbackPulse}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-md ${
              feedbackPulse 
                ? 'bg-indigo-700 text-white animate-pulse cursor-wait' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${feedbackPulse ? 'animate-spin' : ''}`} />
            {feedbackPulse ? 'Pulse Propagating...' : 'Trigger Feedback Cycle'}
          </button>
        </div>
      </div>

      {/* Avatar Multiplier Controller */}
      <div className={`my-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-gray-200">Active Avatar Replication Engines:</span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {avatarCount} Avatars
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Each user-spawned avatar acts as an independent full copy of the VM/Computational Core, driving 10x-style compound scaling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 5, 8].map((count) => (
              <button
                key={count}
                onClick={() => setAvatarCount(count)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  avatarCount === count 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400' 
                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {count} {count === 1 ? 'Avatar' : 'Avatars'}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-700/50">
          <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Avatar Multiplier</span>
            <span className="text-lg font-bold text-blue-400">+{((avatarBoostFactor - 1) * 100).toFixed(0)}%</span>
          </div>
          <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Quantum Core Q</span>
            <span className="text-lg font-bold text-amber-400">{(quantumCoreOutput / 1000).toFixed(1)}k GHz</span>
          </div>
          <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider block">1:1 VM Output</span>
            <span className="text-lg font-bold text-emerald-400">{(vmReplicationOutput / 1000).toFixed(1)}k VM-Ops</span>
          </div>
          <div className="p-2.5 rounded bg-gray-900/60 border border-gray-800">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Compound Synergy</span>
            <span className="text-lg font-bold text-purple-400">{compoundSynergy.toFixed(1)}x Turbo</span>
          </div>
        </div>
      </div>

      {/* Interactive Diagram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                isActive ? step.activeColor : `${step.color} hover:border-gray-600`
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-1">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <h4 className="font-bold text-sm text-gray-100">{step.title}</h4>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-black/40 text-gray-300">
                  {step.stat}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Architecture Flow Connections Summary */}
      <div className="mt-6 p-4 rounded-lg bg-gray-950/60 border border-gray-800/80 text-xs text-gray-400 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span><strong>Controlled Runaway Diesel Principle:</strong> Continuous power multiplication with active DESS/LMCB ethical governors.</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <span>JQLD ➔ LVVM ➔ (AI / Game / Audio / Social / Net) ➔ JHFR ➔ LMCB Checksum</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default CompoundTurboFlowchart;
