# Validation Test Kit

Formula validation suite for testing the mathematical formulas used across my research and other projects. All formulas are based on real physics — derivative works, not invented math.

## What is this

Two halves:

**Frontend (React + Vite + TypeScript)** — an interactive validation dashboard that runs formula suites, compares local vs cloud performance targets, profiles hardware, and visualizes results. Formula sets live in `foundationFormulas.ts`, `quillanFormulas.ts`, and `nextverseFormulas.ts`.

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run lint     # tsc --noEmit
```

**Backend (Python)** — a hardware optimizer / VM control daemon. Provides real-time OS telemetry, ThrottleStop-style CPU unparking, Windows WorkingSet memory compaction, high-priority scheduling, and VM acceleration controls. Serves on port 5000.

```bash
cd backend
python main.py
```

**native_monitor (C++)** — a minimal CMake example that reads logical CPU core count via `std::thread::hardware_concurrency()`. Template only, not a full monitoring app. See `native_monitor/README.md` for build steps.

## Validation reports

- `backend/parity_validation_report.json` — Python parity check results
- `backend/ts_formula_evaluation_report.json` — TypeScript formula evaluation results
- `backend/validation_results.json` — latest validation run

## Requirements

- Node 22+, npm or bun
- Python 3.10+ (`psutil` recommended for full telemetry)
- C++ compiler + CMake 3.10+ (native_monitor only)
- Windows for the CPU unparking / memory compaction features; the dashboard itself is cross-platform
