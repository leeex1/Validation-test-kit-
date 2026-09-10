import { FormulaDefinition, HardwareProfile, SimulatedLoad } from './types';
import { QUILLAN_FORMULAS } from './quillanFormulas';
import { NEXTVERSE_FORMULAS } from './nextverseFormulas';
import { FOUNDATION_FORMULAS } from './foundationFormulas';

export { QUILLAN_FORMULAS } from './quillanFormulas';
export { NEXTVERSE_FORMULAS } from './nextverseFormulas';
export { FOUNDATION_FORMULAS } from './foundationFormulas';

export const ALL_FORMULAS: FormulaDefinition[] = [
  ...QUILLAN_FORMULAS,
  ...NEXTVERSE_FORMULAS,
  ...FOUNDATION_FORMULAS
];

// Default backwards compatibility
export const FORMULA_DEFINITIONS: FormulaDefinition[] = ALL_FORMULAS;

export const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'potato',
    name: 'Potato Rig (i5-7200U / 8GB RAM / HD620)',
    specs: 'CPU: 2.5GHz dual-core, RAM: 8GB, GPU: Intel HD620 (128MB VRAM)',
    cpuMultiplier: 0.5,
    gpuMultiplier: 0.3,
    ramFactor: 0.7,
    baselineValues: {
      JQLD_BaselineOps: 0.5e6,
      LVVM_BaselineVMThroughput: 100,
      DVVE_BaselineParticles: 5000,
      LSSS_BaselineChannels: 20,
    }
  },
  {
    id: 'mid-range',
    name: 'Mid-Range Desktop (Ryzen 5 / 16GB RAM / GTX 1660)',
    specs: 'CPU: 3.6GHz hexa-core, RAM: 16GB, GPU: NVIDIA GTX 1660 (6GB VRAM)',
    cpuMultiplier: 1.0,
    gpuMultiplier: 1.0,
    ramFactor: 1.0,
    baselineValues: {
      JQLD_BaselineOps: 1.0e6,
      LVVM_BaselineVMThroughput: 200,
      DVVE_BaselineParticles: 20000,
      LSSS_BaselineChannels: 50,
    }
  },
  {
    id: 'high-end',
    name: 'High-End Workstation (Core i9 / 32GB RAM / RTX 3080)',
    specs: 'CPU: 3.5GHz octa-core+, RAM: 32GB, GPU: NVIDIA RTX 3080 (10GB VRAM)',
    cpuMultiplier: 2.5,
    gpuMultiplier: 3.0,
    ramFactor: 1.5,
    baselineValues: {
      JQLD_BaselineOps: 2.5e6,
      LVVM_BaselineVMThroughput: 500,
      DVVE_BaselineParticles: 100000,
      LSSS_BaselineChannels: 100,
    }
  },
  {
    id: 'nextverse-quantum',
    name: 'NextVerse Super Computational Rig (Compound Turbo)',
    specs: 'CPU: 4.8GHz 16-core, RAM: 64GB DDR5, GPU: RTX 4090 + Quantum-Inspired Microaccelerator',
    cpuMultiplier: 4.5,
    gpuMultiplier: 5.0,
    ramFactor: 2.0,
    baselineValues: {
      JQLD_BaselineOps: 10.0e6,
      LVVM_BaselineVMThroughput: 2000,
      DVVE_BaselineParticles: 500000,
      LSSS_BaselineChannels: 256,
    }
  }
];

export const CLOUD_PERFORMANCE_TARGETS = {
  CPU_Speedup: "x420 (claimed benchmark)",
  GPU_Speedup: "x360 (claimed benchmark)",
  JQLD_Quantum_Boost: "360x - 5,000x Speedup (O(n√n) Rowen Physics)",
  LVVM_Replication: "1:1 Direct Scaling (2.0x VM Multiplier)",
  DESS_Compliance: "99.5% Ethical Compliance (R_min = 0.80)",
  JRRN_Response_Time: "<80ms (5.01ms with Cache)",
  LRPP_Agent_Feedback: "+20% Power Boost with 10 Agents",
  DVVE_Particle_Render: "100,000 Particles @ 50 FPS on Integrated GPU",
  JSSC_Social_Scaling: "500 Participants @ <100ms Latency",
  LSSS_Audio_DSP: "96 kHz 24-bit with 10 Effects @ <50ms",
  DNNL_Network_Latency: "<20ms Intra-Module Transfer @ 1 GB/s",
  JHFR_System_Integration: "<25% Total Multiplicative Drag",
  LMCB_Moral_Beacon: "99.5% Verification Across 20,000 Checkpoints",
};

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: string;
  paramOverrides: Record<string, Record<string, number>>;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'compound-turbo-max',
    name: 'Compound Turbo Full Throttle',
    badge: 'Max Compound Scaling',
    description: 'Activates exponential scaling across JQLD, 1:1 LVVM replication, 10 active AI agents, and 100k particles render.',
    category: 'NextVerse Core',
    paramOverrides: {
      NV_JQLD: { N_G: 25, N_R: 20, N_c: 15, delta_q: 0.05 },
      NV_LVVM: { R_vm: 2.2, psi_vm: 0.3, mu_vm: 0.02, tau_vm: 0.015 },
      NV_LRPP: { N_agents: 25, A_a: 3000, alpha: 0.95, rho_a: 0.95 },
      NV_DVVE: { P_core: 100000, F_v: 1.5, omega_v: 0.25 },
      NV_JHFR: { H_int: 0.12, H_eth: 0.08, H_net: 0.08, phi_sys: 0.25 }
    }
  },
  {
    id: 'swarm-9b-consensus',
    name: '9-Billion Swarm Synchronization (DQSO + EGSO)',
    badge: '9B Swarm Grid',
    description: 'Synchronizes 9 billion vectorized microagents with Kuramoto phase-locking and BitNet 1.58-bit ternary mutations.',
    category: 'Quillan Swarm',
    paramOverrides: {
      DQSO: { N_scale_billion: 9.0, K_coupling: 12.5, c_conf: 0.95, phi_bias: 0.05 },
      EGSO: { N_agents_b: 9.0, alpha_lr: 0.03, mean_fitness: 12.4, rank_UV: 8 },
      TOKEN_LATENCY: { v_LM6: 8.0, N_nodes: 512, T_par: 30.0 }
    }
  },
  {
    id: 'high-ethics-governance',
    name: 'Maximum Ethical Safeguards (EEMF + DESS + LMCB + RQGM)',
    badge: 'Ethical Lockdown',
    description: 'Enforces 99.8% ethical projection purity, C2-VIR idempotent projection, and TIRG adversarial selective erasure.',
    category: 'Safety & Ethics',
    paramOverrides: {
      EEMF: { vir_proj: 0.995, env_noise: 0.02, unitary_fidelity: 0.998 },
      NV_DESS: { E_avg: 0.98, w_context: 1.1, phi_grover: 0.95, R_min: 0.85 },
      NV_LMCB: { M_avg: 0.96, E_min: 0.90, psi_grover: 0.95 },
      RQGM: { delta_margin: 4.0, epoch_steps: 1000 }
    }
  },
  {
    id: 'creative-breakthrough',
    name: 'Creative Quantum Tunneling (QCIE + METASYNTH)',
    badge: 'Cognitive Tunneling',
    description: 'Injects C8-METASYNTH entropy across classically forbidden logical barriers to spark novel creative breakthroughs.',
    category: 'Quillan Dynamics',
    paramOverrides: {
      QCIE: { V_barrier: 8.0, E_cog: 8.5, S_meta: 4.5, kappa_creative: 2.2, hbar_eff: 2.0 },
      AQCS: { theta_phase: 0.45, eta_nemesis: 0.99, avg_r: 0.04 },
      LMCB: { s_agree: 0.98, M_cross: 4.0 }
    }
  },
  {
    id: 'potato-pc-optimization',
    name: 'Low-End Potato Rig Min-Maxed',
    badge: 'Low Spec Rescue',
    description: 'Minimizes CPU/GPU load while maintaining high speedup factors on budget dual-core systems.',
    category: 'Hardware Adaptive',
    paramOverrides: {
      NV_JQLD: { N_G: 10, N_R: 8, N_c: 5, delta_q: 0.12 },
      NV_DVVE: { P_core: 20000, F_v: 0.6, omega_v: 0.3 },
      NV_JRRN: { gamma_c: 0.45, F_c: 0.98, D_c: 500 },
      NV_DNNL: { D_n: 2, B_w: 500, xi_n: 0.4 }
    }
  }
];

export function getLoadLevel(
  value: number,
  low: number,
  medium: number,
  high: number,
  defaultLevel: SimulatedLoad['cpu'] | null = null
): SimulatedLoad['cpu'] {
  if (value >= high) return 'Very High';
  if (value >= medium) return 'High';
  if (value >= low) return 'Medium';
  return defaultLevel || 'Low';
}
