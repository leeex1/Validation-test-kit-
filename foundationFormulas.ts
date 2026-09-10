import { FormulaDefinition, FormulaCalculationResult, SimulatedLoad } from './types';

function getLoad(val: number, low: number, med: number, high: number): SimulatedLoad['cpu'] {
  if (val >= high) return 'Very High';
  if (val >= med) return 'High';
  if (val >= low) return 'Medium';
  return 'Low';
}

/**
 * FOUNDATION SUITE — GPT-verified canonical ledger (3 layers, 2026-09-10)
 * Sources:
 *  - 01 - Core Architecture/Formulas ledger research.md (GPT deep-research, ~70 entries)
 *  - 10 - Formal Papers/Executive Summary.pdf (same, 10pp)
 * Complements (not duplicates):
 *  - Must know formulas.md (35 modern LLM: Adam/LoRA/PPO/FlashAttn — not repeated here)
 *  - Discrete Mathematics for Enhancing Large.md (Rosen mapping — referenced in validationMethod)
 * Layer mapping:
 *  - Physics -> E_ICE thermodynamic governor + Lee-Mach-6 velocity bounds
 *  - CS -> Complexity Router priors + MoE dispatch + info-theory aux losses
 *  - ML -> training verification (classical complements to Must-Know modern set)
 */
export const FOUNDATION_FORMULAS: FormulaDefinition[] = [
  // ── PHYSICS (12) ──────────────────────────────────────────────
  {
    id: 'F_NEWTON_2ND', numId: 101, key: 'F_NEWTON_2ND', suite: 'foundation',
    name: "Newton's Second Law", concept: 'Classical dynamics',
    derivationBase: 'Newtonian mechanics (inertial frame, non-relativistic)',
    formulaLatex: 'F = ma', formulaString: 'F = m · a',
    inputs: ['m_mass_kg', 'a_accel_ms2'],
    constraints: ['inertial frame', 'non-relativistic'],
    functionalApplication: 'Governor force bound: maps council actuation to E_ICE load caps.',
    category: 'Physics / Mechanics', layer: 'Thermodynamic Governor',
    parameters: [
      { id: 'm', name: 'Mass (m)', defaultValue: 2.0, min: 0.1, max: 100, step: 0.1, unit: 'kg' },
      { id: 'a', name: 'Acceleration (a)', defaultValue: 3.0, min: 0.1, max: 50, step: 0.1, unit: 'm/s²' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const F = p.m * p.a;
      return { primaryResult: F, speedupFactor: 1, secondaryMetrics: { 'Force (F)': F.toFixed(2) + ' N' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.min(100, Math.round(F)) } };
    },
    targetMetric: 'Governor force bound', targetValue: 'F < 100 N equiv', localTargetValue: 'F < 50',
    validationMethod: 'Halliday/Resnick cross-check; SI unit test', primaryUnit: 'N',
  },
  {
    id: 'F_KINETIC', numId: 102, key: 'F_KINETIC', suite: 'foundation',
    name: 'Kinetic Energy', concept: 'Energy of motion',
    derivationBase: 'Work-energy theorem (non-relativistic)',
    formulaLatex: 'K = \\frac{1}{2} m v^2', formulaString: 'K = 0.5 · m · v²',
    inputs: ['m_mass_kg', 'v_speed_ms'],
    constraints: ['non-relativistic (v << c)'],
    functionalApplication: 'Lee-Mach-6 kinetic budget: token-velocity energy envelope.',
    category: 'Physics / Mechanics', layer: 'Thermodynamic Governor',
    parameters: [
      { id: 'm', name: 'Mass (m)', defaultValue: 2.0, min: 0.1, max: 100, step: 0.1, unit: 'kg' },
      { id: 'v', name: 'Speed (v)', defaultValue: 3.0, min: 0.1, max: 100, step: 0.1, unit: 'm/s' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const K = 0.5 * p.m * p.v * p.v;
      return { primaryResult: K, speedupFactor: 1, secondaryMetrics: { 'Energy (K)': K.toFixed(2) + ' J' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.min(100, Math.round(K)) } };
    },
    targetMetric: 'Velocity energy envelope', targetValue: 'K < 500 J equiv', localTargetValue: 'K < 200',
    validationMethod: 'Intro physics cross-check', primaryUnit: 'J',
  },
  {
    id: 'F_GRAVITATION', numId: 103, key: 'F_GRAVITATION', suite: 'foundation',
    name: "Newton's Law of Gravitation", concept: 'Point-mass attraction',
    derivationBase: 'Universal gravitation (spherical shells)',
    formulaLatex: 'F = G\\frac{m_1 m_2}{r^2}', formulaString: 'F = G · m1 · m2 / r²',
    inputs: ['m1_kg', 'm2_kg', 'r_m'],
    constraints: ['point masses or spherical shells'],
    functionalApplication: 'Pull-gate attraction analogy: PersonaPullGate affinity decay prior.',
    category: 'Physics / Gravitation', layer: 'Council Routing Prior',
    parameters: [
      { id: 'm1', name: 'Mass 1', defaultValue: 5.97e24, min: 1e20, max: 1e26, step: 1e22, unit: 'kg' },
      { id: 'm2', name: 'Mass 2', defaultValue: 1000, min: 1, max: 1e6, step: 100, unit: 'kg' },
      { id: 'r', name: 'Separation (r)', defaultValue: 6.371e6, min: 1e6, max: 1e8, step: 1e5, unit: 'm' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const G = 6.674e-11;
      const F = G * p.m1 * p.m2 / (p.r * p.r);
      return { primaryResult: F, speedupFactor: 1, secondaryMetrics: { 'Force (F)': F.toExponential(3) + ' N', 'G': '6.674e-11' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 5 } };
    },
    targetMetric: 'Affinity decay prior', targetValue: '1/r² falloff verified', localTargetValue: 'monotonic decay',
    validationMethod: 'Universal gravitation cross-check', primaryUnit: 'N',
  },
  {
    id: 'F_ORBITAL', numId: 104, key: 'F_ORBITAL', suite: 'foundation',
    name: 'Circular Orbital Velocity', concept: "Kepler 3rd law corollary",
    derivationBase: 'Centripetal = gravitational balance',
    formulaLatex: 'v_{orbit} = \\sqrt{GM/r}', formulaString: 'v_orbit = √(G·M / r)',
    inputs: ['M_central_kg', 'r_orbit_m'],
    constraints: ['circular orbit'],
    functionalApplication: 'Swarm orbit prior: stable microagent circulation velocity around Throne.',
    category: 'Physics / Orbital', layer: 'Swarm Grid',
    parameters: [
      { id: 'M', name: 'Central mass (M)', defaultValue: 5.97e24, min: 1e20, max: 1e26, step: 1e22, unit: 'kg' },
      { id: 'r', name: 'Orbit radius (r)', defaultValue: 6.771e6, min: 6.5e6, max: 4e7, step: 1e5, unit: 'm' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const v = Math.sqrt(6.674e-11 * p.M / p.r);
      return { primaryResult: v, speedupFactor: 1, secondaryMetrics: { 'v_orbit': (v / 1000).toFixed(2) + ' km/s' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 5 } };
    },
    targetMetric: 'Swarm circulation stability', targetValue: '~7.7 km/s LEO equiv', localTargetValue: 'bound orbit',
    validationMethod: 'Circular orbit speed cross-check', primaryUnit: 'm/s',
  },
  {
    id: 'F_ESCAPE', numId: 105, key: 'F_ESCAPE', suite: 'foundation',
    name: 'Escape Velocity', concept: 'Energy-balance escape speed',
    derivationBase: 'KE + U = 0 at infinity',
    formulaLatex: 'v_{esc} = \\sqrt{2GM/r}', formulaString: 'v_esc = √(2·G·M / r)',
    inputs: ['M_body_kg', 'r_surface_m'],
    constraints: ['from surface, no drag'],
    functionalApplication: 'Halt-escape bound: recursion depth that can still return (QSSR companion).',
    category: 'Physics / Orbital', layer: 'Stability Watchdog',
    parameters: [
      { id: 'M', name: 'Body mass (M)', defaultValue: 5.97e24, min: 1e20, max: 1e26, step: 1e22, unit: 'kg' },
      { id: 'r', name: 'Surface radius (r)', defaultValue: 6.371e6, min: 1e6, max: 1e8, step: 1e5, unit: 'm' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const v = Math.sqrt(2 * 6.674e-11 * p.M / p.r);
      return { primaryResult: v, speedupFactor: 1, secondaryMetrics: { 'v_esc': (v / 1000).toFixed(2) + ' km/s' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 5 } };
    },
    targetMetric: 'Recursion return bound', targetValue: '~11.2 km/s Earth equiv', localTargetValue: 'bound escape',
    validationMethod: 'Energy-balance derivation cross-check', primaryUnit: 'm/s',
  },
  {
    id: 'F_SHO', numId: 106, key: 'F_SHO', suite: 'foundation',
    name: 'SHO Period', concept: 'Mass-spring oscillation',
    derivationBase: 'Linear spring, small oscillations',
    formulaLatex: 'T = 2\\pi\\sqrt{m/k}', formulaString: 'T = 2π·√(m/k)',
    inputs: ['m_mass_kg', 'k_spring_Npm'],
    constraints: ['linear regime, F=0 at equilibrium'],
    functionalApplication: 'Governor PID oscillation model for Lee-Mach-6 velocity ringing.',
    category: 'Physics / Oscillations', layer: 'Thermodynamic Governor',
    parameters: [
      { id: 'm', name: 'Mass (m)', defaultValue: 1.0, min: 0.1, max: 20, step: 0.1, unit: 'kg' },
      { id: 'k', name: 'Spring const (k)', defaultValue: 10.0, min: 0.5, max: 200, step: 0.5, unit: 'N/m' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const T = 2 * Math.PI * Math.sqrt(p.m / p.k);
      return { primaryResult: T, speedupFactor: 1 / Math.max(T, 0.01), secondaryMetrics: { 'Period (T)': T.toFixed(3) + ' s', 'Freq': (1 / T).toFixed(2) + ' Hz' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.min(100, Math.round(T * 10)) } };
    },
    targetMetric: 'Governor ring period', targetValue: 'T < 2.0 s equiv', localTargetValue: 'T < 5.0',
    validationMethod: 'SHO period cross-check', primaryUnit: 's',
  },
  {
    id: 'F_IDEAL_GAS', numId: 107, key: 'F_IDEAL_GAS', suite: 'foundation',
    name: 'Ideal Gas Law', concept: 'Ideal-gas behavior',
    derivationBase: 'Kinetic theory, ideal-gas approximation',
    formulaLatex: 'PV = nRT', formulaString: 'T = P·V / (n·R)',
    inputs: ['P_Pa', 'V_m3', 'n_mol'],
    constraints: ['ideal-gas approximation'],
    functionalApplication: 'E_ICE thermal state: token-gas temperature from pressure/volume load.',
    category: 'Physics / Thermodynamics', layer: 'E_ICE Governor',
    parameters: [
      { id: 'P', name: 'Pressure (P)', defaultValue: 101325, min: 10000, max: 500000, step: 1000, unit: 'Pa' },
      { id: 'V', name: 'Volume (V)', defaultValue: 0.024, min: 0.001, max: 1, step: 0.001, unit: 'm³' },
      { id: 'n', name: 'Moles (n)', defaultValue: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'mol' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const T = p.P * p.V / (p.n * 8.314);
      return { primaryResult: T, speedupFactor: 300 / Math.max(T, 1), secondaryMetrics: { 'Temp (T)': T.toFixed(1) + ' K' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.min(100, Math.round(T / 10)) } };
    },
    targetMetric: 'Thermal state bound', targetValue: 'T ≈ 273-350 K band', localTargetValue: 'T < 600 K',
    validationMethod: 'Ideal gas cross-check', primaryUnit: 'K',
  },
  {
    id: 'F_STEFAN', numId: 108, key: 'F_STEFAN', suite: 'foundation',
    name: 'Stefan–Boltzmann Law', concept: 'Blackbody radiation',
    derivationBase: 'Net power into environment at T0',
    formulaLatex: 'P = \\varepsilon\\sigma A(T^4-T_0^4)', formulaString: 'P = ε·σ·A·(T⁴−T₀⁴)',
    inputs: ['eps_emissivity', 'A_area_m2', 'T_K', 'T0_K'],
    constraints: ['gray-body emissivity'],
    functionalApplication: 'E_ICE radiation cap: worst-case thermal dissipation ceiling for dense-pull.',
    category: 'Physics / Thermal', layer: 'E_ICE Governor',
    parameters: [
      { id: 'eps', name: 'Emissivity (ε)', defaultValue: 0.9, min: 0.1, max: 1, step: 0.05 },
      { id: 'A', name: 'Area (A)', defaultValue: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'm²' },
      { id: 'T', name: 'Temp (T)', defaultValue: 300, min: 200, max: 600, step: 5, unit: 'K' },
      { id: 'T0', name: 'Ambient (T₀)', defaultValue: 290, min: 200, max: 500, step: 5, unit: 'K' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const P = p.eps * 5.67e-8 * p.A * (Math.pow(p.T, 4) - Math.pow(p.T0, 4));
      return { primaryResult: P, speedupFactor: 1, secondaryMetrics: { 'Power (P)': P.toFixed(2) + ' W' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.min(100, Math.round(P)) } };
    },
    targetMetric: 'Dissipation ceiling', targetValue: 'P < 100 W equiv', localTargetValue: 'P < 200',
    validationMethod: 'Blackbody radiation cross-check', primaryUnit: 'W',
  },
  {
    id: 'F_LORENTZ', numId: 109, key: 'F_LORENTZ', suite: 'foundation',
    name: 'Lorentz Factor', concept: 'Relativistic dilation',
    derivationBase: 'Special relativity',
    formulaLatex: '\\gamma = 1/\\sqrt{1-v^2/c^2}', formulaString: 'γ = 1/√(1−v²/c²)',
    inputs: ['v_speed_ms'],
    constraints: ['v relative to observer, v < c'],
    functionalApplication: 'Velocity governor clamp: Lee-Mach-6 dilation guard at high token velocity.',
    category: 'Physics / Relativity', layer: 'Velocity Governor',
    parameters: [
      { id: 'v', name: 'Speed (v)', defaultValue: 1e7, min: 1e5, max: 2.9e8, step: 1e6, unit: 'm/s' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const c = 299792458;
      const g = 1 / Math.sqrt(Math.max(1 - (p.v / c) ** 2, 1e-12));
      return { primaryResult: g, speedupFactor: g, secondaryMetrics: { 'γ': g.toFixed(6) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.min(100, Math.round((g - 1) * 50)) } };
    },
    targetMetric: 'Dilation guard', targetValue: 'γ < 1.1 nominal', localTargetValue: 'γ < 2.0',
    validationMethod: 'Special relativity cross-check', primaryUnit: 'γ',
  },
  {
    id: 'F_HEISENBERG', numId: 110, key: 'F_HEISENBERG', suite: 'foundation',
    name: 'Heisenberg Uncertainty', concept: 'Measurement limit',
    derivationBase: 'QM principle (fundamental limit)',
    formulaLatex: '\\Delta x\\,\\Delta p \\ge \\hbar/2', formulaString: 'Δx·Δp ≥ ℏ/2',
    inputs: ['dx_m'],
    constraints: ['fundamental limit'],
    functionalApplication: 'Precision floor: probe measurement vs perturbation tradeoff in eval harness.',
    category: 'Physics / Quantum', layer: 'Eval Harness',
    parameters: [
      { id: 'dx', name: 'Position uncertainty (Δx)', defaultValue: 1e-9, min: 1e-12, max: 1e-6, step: 1e-10, unit: 'm' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const dp = 1.0545718e-34 / 2 / p.dx;
      return { primaryResult: dp, speedupFactor: 1, secondaryMetrics: { 'Δp_min': dp.toExponential(3) + ' kg·m/s' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 1 } };
    },
    targetMetric: 'Measurement floor', targetValue: 'bound respected', localTargetValue: 'bound respected',
    validationMethod: 'QM principle cross-check', primaryUnit: 'kg·m/s',
  },
  {
    id: 'F_MAXWELL_GAUSS_E', numId: 111, key: 'F_MAXWELL_GAUSS_E', suite: 'foundation',
    name: "Gauss's Law (electric)", concept: "Maxwell eq.",
    derivationBase: 'Integral: ∮E·dA = Q_enc/ε₀',
    formulaLatex: '\\nabla\\cdot\\mathbf{E} = \\rho/\\varepsilon_0', formulaString: '∮E·dA = Q_enc/ε₀',
    inputs: ['Q_enc_C', 'area_m2'],
    constraints: ['electrostatics'],
    functionalApplication: 'Flux prior: council field divergence check for pull-gate balance.',
    category: 'Physics / EM', layer: 'Routing Balance',
    parameters: [
      { id: 'Q', name: 'Enclosed charge', defaultValue: 1e-6, min: 1e-9, max: 1e-3, step: 1e-7, unit: 'C' },
      { id: 'A', name: 'Surface area', defaultValue: 1.0, min: 0.1, max: 10, step: 0.1, unit: 'm²' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const E = p.Q / 8.854e-12 / p.A;
      return { primaryResult: E, speedupFactor: 1, secondaryMetrics: { 'E flux': E.toExponential(3) + ' V/m' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 5 } };
    },
    targetMetric: 'Field balance', targetValue: 'divergence bounded', localTargetValue: 'bounded',
    validationMethod: 'Maxwell eq. cross-check', primaryUnit: 'V/m',
  },
  {
    id: 'F_LANDAUER', numId: 112, key: 'F_LANDAUER', suite: 'foundation',
    name: 'Landauer Bound (E_ICE floor)', concept: 'Thermodynamic compute floor',
    derivationBase: 'kB·T·ln2 (Samurai:3279 with I_s·γ² scale)',
    formulaLatex: 'E_{min} = k_B T \\ln 2', formulaString: 'E_min = kB·T·ln2',
    inputs: ['T_K'],
    constraints: ['T > 0'],
    functionalApplication: 'E_ICE analytic floor: minimum energy per erased bit, scales all aux caps.',
    category: 'Physics / Thermodynamics', layer: 'E_ICE Governor',
    parameters: [
      { id: 'T', name: 'Temp (T)', defaultValue: 300, min: 200, max: 500, step: 5, unit: 'K' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const E = 1.380649e-23 * p.T * Math.LN2;
      return { primaryResult: E, speedupFactor: 1, secondaryMetrics: { 'E_min': E.toExponential(3) + ' J/bit' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 10 } };
    },
    targetMetric: 'E_ICE floor', targetValue: '~2.87e-21 J/bit @300K', localTargetValue: 'floor respected',
    validationMethod: 'Landauer cross-check; Samurai E_ICE analytic', primaryUnit: 'J/bit',
  },
  // ── CS (10) ───────────────────────────────────────────────────
  {
    id: 'C_ENTROPY', numId: 201, key: 'C_ENTROPY', suite: 'foundation',
    name: 'Shannon Entropy', concept: 'Uncertainty measure',
    derivationBase: 'Information theory (bits for b=2)',
    formulaLatex: 'H(X) = -\\sum_x P(x)\\log_b P(x)', formulaString: 'H = −Σ P·log₂P',
    inputs: ['p_uniform_n'],
    constraints: ['ΣP = 1'],
    functionalApplication: 'QICS companion: validates von Neumann entropy inputs on classical side.',
    category: 'CS / Information Theory', layer: 'Info Aux',
    parameters: [
      { id: 'n', name: 'Uniform outcomes (n)', defaultValue: 8, min: 2, max: 64, step: 1, isInteger: true },
    ],
    calculation: (p): FormulaCalculationResult => {
      const H = Math.log2(p.n);
      return { primaryResult: H, speedupFactor: 1 + H / 8, secondaryMetrics: { 'H (bits)': H.toFixed(3) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.round(H * 5) } };
    },
    targetMetric: 'Entropy calibration', targetValue: 'H = log2(n)', localTargetValue: 'exact',
    validationMethod: 'Information theory cross-check', primaryUnit: 'bits',
  },
  {
    id: 'C_KL', numId: 202, key: 'C_KL', suite: 'foundation',
    name: 'Kullback–Leibler Divergence', concept: 'Distribution divergence (non-symmetric)',
    derivationBase: 'Statistics / information theory',
    formulaLatex: 'D_{KL}(P\\|Q) = \\sum_x P(x)\\log(P(x)/Q(x))', formulaString: 'DKL = Σ P·ln(P/Q)',
    inputs: ['p_head', 'q_head'],
    constraints: ['non-symmetric; P,Q > 0'],
    functionalApplication: 'DistillationHead KL0.7 companion: teacher-student divergence check.',
    category: 'CS / Information Theory', layer: 'Distillation',
    parameters: [
      { id: 'p', name: 'P mass', defaultValue: 0.7, min: 0.01, max: 0.99, step: 0.01 },
      { id: 'q', name: 'Q mass', defaultValue: 0.5, min: 0.01, max: 0.99, step: 0.01 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const dkl = p.p * Math.log(p.p / p.q) + (1 - p.p) * Math.log((1 - p.p) / (1 - p.q));
      return { primaryResult: dkl, speedupFactor: 1, secondaryMetrics: { 'DKL (nats)': dkl.toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.round(dkl * 20) } };
    },
    targetMetric: 'Divergence bound', targetValue: 'DKL ≥ 0', localTargetValue: 'DKL ≥ 0',
    validationMethod: 'Statistics cross-check; Gibbs inequality', primaryUnit: 'nats',
  },
  {
    id: 'C_BAYES', numId: 203, key: 'C_BAYES', suite: 'foundation',
    name: "Bayes' Theorem", concept: 'Posterior update',
    derivationBase: 'Probability theory (P(B) ≠ 0)',
    formulaLatex: 'P(A|B) = P(B|A)P(A)/P(B)', formulaString: 'post = like·prior / evidence',
    inputs: ['likelihood', 'prior', 'evidence'],
    constraints: ['evidence ≠ 0'],
    functionalApplication: 'QCRDM companion: classical posterior check for Born deduction probs.',
    category: 'CS / Probability', layer: 'Decision Check',
    parameters: [
      { id: 'like', name: 'Likelihood', defaultValue: 0.8, min: 0.01, max: 1, step: 0.01 },
      { id: 'prior', name: 'Prior', defaultValue: 0.1, min: 0.01, max: 1, step: 0.01 },
      { id: 'ev', name: 'Evidence', defaultValue: 0.2, min: 0.01, max: 1, step: 0.01 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const post = Math.min(1, p.like * p.prior / Math.max(p.ev, 1e-12));
      return { primaryResult: post * 100, speedupFactor: 1, secondaryMetrics: { 'Posterior': post.toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 5 } };
    },
    targetMetric: 'Posterior calibration', targetValue: 'post ∈ [0,1]', localTargetValue: '∈ [0,1]',
    validationMethod: 'Probability theory cross-check', primaryUnit: '%',
  },
  {
    id: 'C_HANDSHAKE', numId: 204, key: 'C_HANDSHAKE', suite: 'foundation',
    name: 'Handshaking Lemma', concept: 'Degree-sum formula',
    derivationBase: 'Graph theory (Σdeg = 2|E|)',
    formulaLatex: '\\sum_{v} deg(v) = 2|E|', formulaString: 'Σdeg = 2·|E|',
    inputs: ['E_edges'],
    constraints: ['undirected, no loops'],
    functionalApplication: 'Council graph invariant: 34-node deliberation edge-count check.',
    category: 'CS / Graph Theory', layer: 'Council Graph',
    parameters: [
      { id: 'E', name: 'Edge count |E|', defaultValue: 561, min: 1, max: 2000, step: 1, isInteger: true, unit: 'edges' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const s = 2 * p.E;
      return { primaryResult: s, speedupFactor: 1, secondaryMetrics: { 'Σdeg': `${s}`, 'K34 edges': '561 (34·33/2)' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Graph invariant', targetValue: 'Σdeg = 1122 for K34', localTargetValue: 'exact',
    validationMethod: 'Graph theory cross-check', primaryUnit: 'degree-sum',
  },
  {
    id: 'C_CATALAN', numId: 205, key: 'C_CATALAN', suite: 'foundation',
    name: 'Catalan Number', concept: 'Dyck paths / trees count',
    derivationBase: 'C_n = (2n)!/((n+1)!n!)',
    formulaLatex: 'C_n = \\frac{1}{n+1}\\binom{2n}{n}', formulaString: 'C_n = C(2n,n)/(n+1)',
    inputs: ['n_index'],
    constraints: ['n ≥ 0 integer'],
    functionalApplication: 'Complexity Router prior: balanced-parentheses parse-shape counts for CoT branching.',
    category: 'CS / Combinatorics', layer: 'Router Prior',
    parameters: [
      { id: 'n', name: 'Index (n)', defaultValue: 5, min: 0, max: 12, step: 1, isInteger: true },
    ],
    calculation: (p): FormulaCalculationResult => {
      const comb = (n: number, k: number): number => { let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); };
      const c = comb(2 * p.n, p.n) / (p.n + 1);
      return { primaryResult: c, speedupFactor: 1, secondaryMetrics: { 'C_n': `${c}` }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Branching prior', targetValue: 'C_5 = 42', localTargetValue: 'exact',
    validationMethod: 'Combinatorics cross-check', primaryUnit: 'count',
  },
  {
    id: 'C_FIB', numId: 206, key: 'C_FIB', suite: 'foundation',
    name: 'Fibonacci Recurrence', concept: 'F_n = F_{n-1}+F_{n-2}',
    derivationBase: 'F_0=0, F_1=1',
    formulaLatex: 'F_n = F_{n-1}+F_{n-2}', formulaString: 'F_n iterative',
    inputs: ['n_index'],
    constraints: ['n ≥ 0 integer'],
    functionalApplication: 'Search-heuristic growth prior for beam expansion schedules.',
    category: 'CS / Recurrences', layer: 'Search Prior',
    parameters: [
      { id: 'n', name: 'Index (n)', defaultValue: 10, min: 0, max: 30, step: 1, isInteger: true },
    ],
    calculation: (p): FormulaCalculationResult => {
      let a = 0, b = 1; for (let i = 0; i < p.n; i++) { const t = a + b; a = b; b = t; }
      return { primaryResult: a, speedupFactor: 1, secondaryMetrics: { 'F_n': `${a}` }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Growth prior', targetValue: 'F_10 = 55', localTargetValue: 'exact',
    validationMethod: 'Fibonacci cross-check', primaryUnit: 'count',
  },
  {
    id: 'C_MASTER', numId: 207, key: 'C_MASTER', suite: 'foundation',
    name: 'Master Theorem (recurrence)', concept: 'Divide-and-conquer asymptotics',
    derivationBase: 'CLRS: compare d vs log_b(a)',
    formulaLatex: 'T(n)=aT(n/b)+O(n^d)', formulaString: 'regime via d vs log_b(a)',
    inputs: ['a_branches', 'b_factor', 'd_poly'],
    constraints: ['a≥1, b>1'],
    functionalApplication: 'TOKEN_LATENCY companion: predicts swarm dispatch scaling regime.',
    category: 'CS / Algorithms', layer: 'Latency Model',
    parameters: [
      { id: 'a', name: 'Branches (a)', defaultValue: 2, min: 1, max: 8, step: 1, isInteger: true },
      { id: 'b', name: 'Factor (b)', defaultValue: 2, min: 2, max: 8, step: 1, isInteger: true },
      { id: 'd', name: 'Poly (d)', defaultValue: 1, min: 0, max: 3, step: 0.5 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const logba = Math.log(p.a) / Math.log(p.b);
      let regime: string; if (Math.abs(p.d - logba) < 1e-9) regime = `Θ(n^${p.d} log n)`; else if (p.d < logba) regime = `Θ(n^${logba.toFixed(3)})`; else regime = `Θ(n^${p.d})`;
      return { primaryResult: logba, speedupFactor: 1, secondaryMetrics: { 'Regime': regime, 'log_b(a)': logba.toFixed(3) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Scaling regime', targetValue: 'correct case', localTargetValue: 'correct case',
    validationMethod: 'CLRS Master Theorem cross-check', primaryUnit: 'log_b(a)',
  },
  {
    id: 'C_MI', numId: 208, key: 'C_MI', suite: 'foundation',
    name: 'Mutual Information', concept: 'Shared info (symmetric)',
    derivationBase: 'I(X;Y) = H(X) − H(X|Y)',
    formulaLatex: 'I(X;Y) = H(X)-H(X|Y)', formulaString: 'I via entropies',
    inputs: ['Hx_bits', 'Hx_y_bits'],
    constraints: ['symmetric; ≥ 0'],
    functionalApplication: 'JHFR companion: classical intent-utility check for bottleneck loss.',
    category: 'CS / Information Theory', layer: 'Alignment Check',
    parameters: [
      { id: 'hx', name: 'H(X)', defaultValue: 4.8, min: 0.5, max: 15, step: 0.2, unit: 'bits' },
      { id: 'hxy', name: 'H(X|Y)', defaultValue: 0.9, min: 0.1, max: 10, step: 0.1, unit: 'bits' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const mi = Math.max(0, p.hx - p.hxy);
      return { primaryResult: mi, speedupFactor: 1 + mi / 10, secondaryMetrics: { 'I(X;Y)': mi.toFixed(3) + ' bits' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.round(mi * 5) } };
    },
    targetMetric: 'Intent utility', targetValue: 'I ≥ 0', localTargetValue: 'I ≥ 0',
    validationMethod: 'Information theory cross-check', primaryUnit: 'bits',
  },
  {
    id: 'C_DFT_K1', numId: 209, key: 'C_DFT_K1', suite: 'foundation',
    name: 'DFT k=1 Magnitude', concept: 'First Fourier component',
    derivationBase: 'X_1 = Σ x_n e^{−2πi·n/N}',
    formulaLatex: 'X_1 = \\sum_{n=0}^{N-1} x_n e^{-2\\pi i n/N}', formulaString: '|X_1| closed form',
    inputs: ['N_size'],
    constraints: ['unit-impulse input'],
    functionalApplication: 'Spectral routing check: validates p-adic/spectral router frequency response.',
    category: 'CS / Signal Processing', layer: 'Spectral Router',
    parameters: [
      { id: 'N', name: 'Size (N)', defaultValue: 16, min: 4, max: 128, step: 4, isInteger: true },
    ],
    calculation: (p): FormulaCalculationResult => {
      const mag = 1.0;
      return { primaryResult: mag, speedupFactor: 1, secondaryMetrics: { '|X_1|': mag.toFixed(4), 'N': `${p.N}` }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Spectral response', targetValue: '|X_1| = 1', localTargetValue: 'exact',
    validationMethod: 'DFT definition cross-check', primaryUnit: 'magnitude',
  },
  {
    id: 'C_CAYLEY', numId: 210, key: 'C_CAYLEY', suite: 'foundation',
    name: "Cayley's Formula", concept: 'Labeled trees count',
    derivationBase: 'n^(n−2) spanning trees on n labeled nodes',
    formulaLatex: 'n^{n-2}', formulaString: 'n^(n−2)',
    inputs: ['n_nodes'],
    constraints: ['n ≥ 2 integer'],
    functionalApplication: 'Council spanning prior: deliberation tree-shape counts over 34 nodes.',
    category: 'CS / Combinatorics', layer: 'Council Graph',
    parameters: [
      { id: 'n', name: 'Nodes (n)', defaultValue: 4, min: 2, max: 8, step: 1, isInteger: true },
    ],
    calculation: (p): FormulaCalculationResult => {
      const c = Math.pow(p.n, p.n - 2);
      return { primaryResult: c, speedupFactor: 1, secondaryMetrics: { 'Trees': `${c}` }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Tree prior', targetValue: '4^2 = 16', localTargetValue: 'exact',
    validationMethod: 'Graph theory cross-check', primaryUnit: 'count',
  },
  // ── ML (12 classical complements; modern set lives in Must-Know) ──
  {
    id: 'M_SIGMOID', numId: 301, key: 'M_SIGMOID', suite: 'foundation',
    name: 'Sigmoid (Logistic)', concept: 'Binary activation, range (0,1)',
    derivationBase: "σ' = σ(1−σ)",
    formulaLatex: '\\sigma(x) = 1/(1+e^{-x})', formulaString: 'σ = 1/(1+e^(−x))',
    inputs: ['x_input'],
    constraints: ['range (0,1)'],
    functionalApplication: 'Gate activation check for PersonaPullGateщено sigmoids.',
    category: 'ML / Activations', layer: 'Training Check',
    parameters: [
      { id: 'x', name: 'Input (x)', defaultValue: 0.5, min: -6, max: 6, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const s = 1 / (1 + Math.exp(-p.x));
      return { primaryResult: s, speedupFactor: 1, secondaryMetrics: { 'σ(x)': s.toFixed(4), "σ'": (s * (1 - s)).toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Activation sanity', targetValue: 'σ ∈ (0,1)', localTargetValue: '∈ (0,1)',
    validationMethod: 'ML texts cross-check', primaryUnit: 'σ',
  },
  {
    id: 'M_TANH', numId: 302, key: 'M_TANH', suite: 'foundation',
    name: 'Hyperbolic Tangent', concept: 'Activation, range (−1,1)',
    derivationBase: '(e^x−e^−x)/(e^x+e^−x)',
    formulaLatex: '\\tanh(x)', formulaString: 'tanh(x)',
    inputs: ['x_input'],
    constraints: ['range (−1,1)'],
    functionalApplication: 'Couil gate activation check.',
    category: 'ML / Activations', layer: 'Training Check',
    parameters: [
      { id: 'x', name: 'Input (x)', defaultValue: 0.5, min: -4, max: 4, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const t = Math.tanh(p.x);
      return { primaryResult: t, speedupFactor: 1, secondaryMetrics: { 'tanh(x)': t.toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Activation sanity', targetValue: 'tanh ∈ (−1,1)', localTargetValue: '∈ (−1,1)',
    validationMethod: 'ML texts cross-check', primaryUnit: 'tanh',
  },
  {
    id: 'M_SOFTMAX3', numId: 303, key: 'M_SOFTMAX3', suite: 'foundation',
    name: 'Softmax (3-logit)', concept: 'Multi-class probabilities (sum 1)',
    derivationBase: 'e^z_i / Σe^z_j',
    formulaLatex: '\\sigma(z)_i = e^{z_i}/\\sum_j e^{z_j}', formulaString: 'softmax demo',
    inputs: ['z1', 'z2', 'z3'],
    constraints: ['outputs sum to 1'],
    functionalApplication: 'Router softmax sanity: dense-pull distribution sums to 1.',
    category: 'ML / Activations', layer: 'Router Check',
    parameters: [
      { id: 'z1', name: 'Logit 1', defaultValue: 2.0, min: -5, max: 5, step: 0.1 },
      { id: 'z2', name: 'Logit 2', defaultValue: 1.0, min: -5, max: 5, step: 0.1 },
      { id: 'z3', name: 'Logit 3', defaultValue: 0.5, min: -5, max: 5, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const e = [Math.exp(p.z1), Math.exp(p.z2), Math.exp(p.z3)];
      const s = e[0] + e[1] + e[2];
      const top = Math.max(...e) / s;
      return { primaryResult: top * 100, speedupFactor: 1, secondaryMetrics: { 'Top-1': (top * 100).toFixed(1) + '%', 'Sum': '1.000' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Distribution sanity', targetValue: 'Σ = 1', localTargetValue: 'Σ = 1',
    validationMethod: 'ML literature cross-check', primaryUnit: '%',
  },
  {
    id: 'M_CE', numId: 304, key: 'M_CE', suite: 'foundation',
    name: 'Categorical Cross-Entropy', concept: 'Classification loss',
    derivationBase: '−Σ y·ln(ŷ); minimizes divergence from truth',
    formulaLatex: 'L_{CE} = -\\sum_i y_i\\ln(\\hat y_i)', formulaString: '−ln(ŷ_true)',
    inputs: ['yhat_true_prob'],
    constraints: ['ŷ ∈ (0,1]'],
    functionalApplication: 'Training loss check: matches train_frontier_capability.py CE.',
    category: 'ML / Losses', layer: 'Training Check',
    parameters: [
      { id: 'yhat', name: 'Predicted P(true)', defaultValue: 0.7, min: 0.01, max: 1, step: 0.01 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const ce = -Math.log(Math.max(p.yhat, 1e-12));
      return { primaryResult: ce, speedupFactor: 1, secondaryMetrics: { 'CE (nats)': ce.toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.round(ce * 10) } };
    },
    targetMetric: 'Loss sanity', targetValue: 'CE ≥ 0', localTargetValue: 'CE ≥ 0',
    validationMethod: 'Information theory cross-check', primaryUnit: 'nats',
  },
  {
    id: 'M_MSE', numId: 305, key: 'M_MSE', suite: 'foundation',
    name: 'Mean Squared Error', concept: 'Regression loss (quadratic penalty)',
    derivationBase: 'Statistics least squares',
    formulaLatex: 'L_{MSE} = (1/n)\\sum (y-\\hat y)^2', formulaString: 'mean((y−ŷ)²)',
    inputs: ['err_scalar'],
    constraints: ['quadratic penalty'],
    functionalApplication: 'Regression head check for value/distillation heads.',
    category: 'ML / Losses', layer: 'Training Check',
    parameters: [
      { id: 'e', name: 'Error (y−ŷ)', defaultValue: 0.5, min: -5, max: 5, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const mse = p.e * p.e;
      return { primaryResult: mse, speedupFactor: 1, secondaryMetrics: { 'MSE': mse.toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Loss sanity', targetValue: 'MSE ≥ 0', localTargetValue: 'MSE ≥ 0',
    validationMethod: 'Statistics cross-check', primaryUnit: 'MSE',
  },
  {
    id: 'M_GD', numId: 306, key: 'M_GD', suite: 'foundation',
    name: 'Gradient Descent Update', concept: 'Iterative parameter update',
    derivationBase: 'θ ← θ − η∇L(θ)',
    formulaLatex: '\\theta \\leftarrow \\theta - \\eta\\nabla L', formulaString: 'θ − η·g',
    inputs: ['theta', 'lr_eta', 'grad'],
    constraints: ['η > 0'],
    functionalApplication: 'Optimizer sanity: matches MuonK2/AdamW update direction.',
    category: 'ML / Optimization', layer: 'Training Check',
    parameters: [
      { id: 'theta', name: 'Param (θ)', defaultValue: 100, min: 0, max: 500, step: 5 },
      { id: 'eta', name: 'LR (η)', defaultValue: 0.05, min: 0.001, max: 0.5, step: 0.005 },
      { id: 'g', name: 'Gradient (∇L)', defaultValue: 12.4, min: 0, max: 50, step: 0.5 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const next = p.theta - p.eta * p.g;
      return { primaryResult: next, speedupFactor: 1, secondaryMetrics: { 'θ_new': next.toFixed(3), 'Δ': (p.eta * p.g).toFixed(3) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Update sanity', targetValue: 'descent direction', localTargetValue: 'descent',
    validationMethod: 'Optimization theory cross-check', primaryUnit: 'θ',
  },
  {
    id: 'M_NORMAL_EQ', numId: 307, key: 'M_NORMAL_EQ', suite: 'foundation',
    name: 'Normal Equation (2D)', concept: 'Least-squares closed form',
    derivationBase: 'β̂ = (XᵀX)⁻¹Xᵀy; requires invertible XtX',
    formulaLatex: '\\hat\\beta = (X^TX)^{-1}X^Ty', formulaString: '2×2 closed form',
    inputs: ['a11', 'a12', 'a22', 'b1', 'b2'],
    constraints: ['XtX invertible (det ≠ 0)'],
    functionalApplication: 'Init check: validates transplant projection solves (transplant_clean.py).',
    category: 'ML / Regression', layer: 'Init Check',
    parameters: [
      { id: 'a11', name: 'XtX[0,0]', defaultValue: 4, min: 1, max: 10, step: 0.5 },
      { id: 'a12', name: 'XtX[0,1]', defaultValue: 1, min: -5, max: 5, step: 0.5 },
      { id: 'a22', name: 'XtX[1,1]', defaultValue: 3, min: 1, max: 10, step: 0.5 },
      { id: 'b1', name: 'Xᵀy[0]', defaultValue: 5, min: -10, max: 10, step: 0.5 },
      { id: 'b2', name: 'Xᵀy[1]', defaultValue: 2, min: -10, max: 10, step: 0.5 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const det = p.a11 * p.a22 - p.a12 * p.a12;
      if (Math.abs(det) < 1e-9) return { primaryResult: NaN, error: 'singular XtX', secondaryMetrics: { det: det.toFixed(4) } };
      const b0 = (p.a22 * p.b1 - p.a12 * p.b2) / det;
      const b1 = (-p.a12 * p.b1 + p.a11 * p.b2) / det;
      return { primaryResult: Math.hypot(b0, b1), speedupFactor: 1, secondaryMetrics: { 'β̂₀': b0.toFixed(4), 'β̂₁': b1.toFixed(4), det: det.toFixed(3) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Init solve', targetValue: 'det ≠ 0', localTargetValue: 'det ≠ 0',
    validationMethod: 'Statistics closed-form cross-check', primaryUnit: '‖β̂‖',
  },
  {
    id: 'M_ATTENTION', numId: 308, key: 'M_ATTENTION', suite: 'foundation',
    name: 'Scaled Dot-Product Attention (2×2)', concept: 'Transformer core (Vaswani 2017)',
    derivationBase: 'softmax(QKᵀ/√d_k)V',
    formulaLatex: 'Attn = softmax(QK^T/\\sqrt{d_k})V', formulaString: '2×2 closed form',
    inputs: ['q11', 'q12', 'k_scale'],
    constraints: ['d_k > 0'],
    functionalApplication: 'Attention sanity: matches Couil dense-head forward on toy input.',
    category: 'ML / Attention', layer: 'Training Check',
    parameters: [
      { id: 'q11', name: 'Q[0,0]', defaultValue: 1.0, min: -3, max: 3, step: 0.1 },
      { id: 'q12', name: 'Q[0,1]', defaultValue: 0.5, min: -3, max: 3, step: 0.1 },
      { id: 'ks', name: 'K scale', defaultValue: 1.0, min: 0.2, max: 3, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const dk = 2;
      const s = (p.q11 * p.ks + p.q12 * p.ks) / Math.sqrt(dk);
      const w = 1 / (1 + Math.exp(-s));
      return { primaryResult: w, speedupFactor: 1, secondaryMetrics: { 'attn_w': w.toFixed(4), 'scale': `1/√${dk}` }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Attention sanity', targetValue: 'w ∈ (0,1)', localTargetValue: '∈ (0,1)',
    validationMethod: 'Vaswani et al. 2017 cross-check', primaryUnit: 'weight',
  },
  {
    id: 'M_GAUSSIAN', numId: 309, key: 'M_GAUSSIAN', suite: 'foundation',
    name: 'Gaussian (Normal) PDF', concept: 'Noise/prior model (area 1)',
    derivationBase: 'exp(−(x−μ)²/2σ²)/(σ√2π)',
    formulaLatex: 'p(x) = e^{-(x-\\mu)^2/2\\sigma^2}/(\\sigma\\sqrt{2\\pi})', formulaString: 'N(x;μ,σ)',
    inputs: ['x_val', 'mu', 'sigma'],
    constraints: ['σ > 0; area = 1'],
    functionalApplication: 'Noise prior check for diffusion/Langevin inv-√t schedules.',
    category: 'ML / Probability', layer: 'Prior Check',
    parameters: [
      { id: 'x', name: 'Value (x)', defaultValue: 0.5, min: -4, max: 4, step: 0.1 },
      { id: 'mu', name: 'Mean (μ)', defaultValue: 0, min: -3, max: 3, step: 0.1 },
      { id: 'sigma', name: 'Std (σ)', defaultValue: 1.0, min: 0.2, max: 3, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const pdf = Math.exp(-((p.x - p.mu) ** 2) / (2 * p.sigma * p.sigma)) / (p.sigma * Math.sqrt(2 * Math.PI));
      return { primaryResult: pdf, speedupFactor: 1, secondaryMetrics: { 'p(x)': pdf.toFixed(4) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Prior sanity', targetValue: 'p ≥ 0', localTargetValue: 'p ≥ 0',
    validationMethod: 'Probability theory cross-check', primaryUnit: 'density',
  },
  {
    id: 'M_BELLMAN', numId: 310, key: 'M_BELLMAN', suite: 'foundation',
    name: 'Bellman Expectation (Q)', concept: 'Policy evaluation (RL)',
    derivationBase: 'Q = r + γE[Q′]',
    formulaLatex: "Q^\\pi = r + \\gamma E[Q']", formulaString: 'r + γ·Q′',
    inputs: ['r_reward', 'gamma_discount', 'q_next'],
    constraints: ['γ ∈ [0,1]'],
    functionalApplication: 'Self-audit loop check: recursive value backup for self-recursive target.',
    category: 'ML / RL', layer: 'Audit Loop',
    parameters: [
      { id: 'r', name: 'Reward (r)', defaultValue: 1.0, min: -5, max: 5, step: 0.1 },
      { id: 'gamma', name: 'Discount (γ)', defaultValue: 0.99, min: 0, max: 1, step: 0.01 },
      { id: 'qn', name: "Next Q (Q′)", defaultValue: 5.0, min: -10, max: 20, step: 0.5 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const q = p.r + p.gamma * p.qn;
      return { primaryResult: q, speedupFactor: 1, secondaryMetrics: { 'Q': q.toFixed(3) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 3 } };
    },
    targetMetric: 'Backup sanity', targetValue: 'finite Q', localTargetValue: 'finite',
    validationMethod: 'RL literature cross-check', primaryUnit: 'Q',
  },
  {
    id: 'M_RETURN', numId: 311, key: 'M_RETURN', suite: 'foundation',
    name: 'Return (Cumulative Reward)', concept: 'R_n = Σr_t',
    derivationBase: 'RL notation (common)',
    formulaLatex: 'R_n = \\sum_{t=1}^n r_t', formulaString: 'n·r̄',
    inputs: ['n_steps', 'r_mean'],
    constraints: ['finite horizon'],
    functionalApplication: 'Episode audit: cumulative reward check for self-auditing rollouts.',
    category: 'ML / RL', layer: 'Audit Loop',
    parameters: [
      { id: 'n', name: 'Steps (n)', defaultValue: 10, min: 1, max: 100, step: 1, isInteger: true },
      { id: 'rbar', name: 'Mean reward (r̄)', defaultValue: 0.5, min: -2, max: 2, step: 0.1 },
    ],
    calculation: (p): FormulaCalculationResult => {
      const R = p.n * p.rbar;
      return { primaryResult: R, speedupFactor: 1, secondaryMetrics: { 'R_n': R.toFixed(2) }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: 2 } };
    },
    targetMetric: 'Audit sum', targetValue: 'finite R', localTargetValue: 'finite',
    validationMethod: 'RL notation cross-check', primaryUnit: 'R',
  },
  {
    id: 'M_CONDH', numId: 312, key: 'M_CONDH', suite: 'foundation',
    name: 'Conditional Entropy', concept: 'H(X|Y) = H(X,Y) − H(Y)',
    derivationBase: '−Σ P(x,y) log P(x|y)',
    formulaLatex: 'H(X|Y) = H(X,Y)-H(Y)', formulaString: 'joint − marginal',
    inputs: ['Hxy_joint_bits', 'Hy_bits'],
    constraints: ['H(X|Y) ≤ H(X)'],
    functionalApplication: 'MI companion: validates JHFR bottleneck inputs classically.',
    category: 'ML / Information Theory', layer: 'Alignment Check',
    parameters: [
      { id: 'hxy', name: 'H(X,Y)', defaultValue: 5.7, min: 0.5, max: 20, step: 0.2, unit: 'bits' },
      { id: 'hy', name: 'H(Y)', defaultValue: 4.8, min: 0.5, max: 15, step: 0.2, unit: 'bits' },
    ],
    calculation: (p): FormulaCalculationResult => {
      const h = Math.max(0, p.hxy - p.hy);
      return { primaryResult: h, speedupFactor: 1, secondaryMetrics: { 'H(X|Y)': h.toFixed(3) + ' bits' }, simulatedLoadEstimate: { cpu: 'Low', gpu: 'Low', ram: 'Low', thermodynamic: Math.round(h * 5) } };
    },
    targetMetric: 'Entropy sanity', targetValue: 'H ≥ 0', localTargetValue: 'H ≥ 0',
    validationMethod: 'Information theory cross-check', primaryUnit: 'bits',
  },
];
