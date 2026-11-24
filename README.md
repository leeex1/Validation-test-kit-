# Validation Test Kit

## 🧭 Canonical project context

| | |
| :--- | :--- |
| **This repo** | Formula validation suite for the mathematical formulas used across the research and projects. |
| **Canonical package** | Three deployed models: Quillan-Ronin Flagship (~1B), Quillan-Ronin-Mini (~0.8B) and Quillan-Dragon (~1B). The ONI Python sources are implementation/training only. |
| **Donor design** | Flagship and Mini: Qwen 0.6B + Llama ~1B + BitNet 2B-4T + Falcon3 ~1B **as a group** (cross-match fix in progress). Dragon: Falcon3 with an Ollama system message running Quillan's system prompt. |
| **Reading the scores** | The 95–100% table in the root README is **Track A** — the Quillan harness on a third-party frontier base, not a Quillan checkpoint. Hard-exam cells are pending re-test; ARC-AGI-3 public ~99s, private pending. |
| **Historical framing** | Edo period, rōnin and bushidō are real Japanese history and ethics — not roleplay, game mechanics, or fantasy lore. |
| **Canonical docs** | [Root README](https://github.com/leeex1/Quillan-Ronin#readme) · [Fleet model cards](https://github.com/leeex1/Quillan-Ronin/blob/main/docs/MODEL_CARDS.md) |

<!-- QUILLAN-DOCS-PROVENANCE:BEGIN -->
<details>
<summary><b>📌 Quillan documentation provenance</b> — expand for canonical sources</summary>

> **Documentation provenance.** This repo is part of the Quillan-Ronin ecosystem (CrashOverrideX / `leeex1`). Canonical sources live in the root repository: `README.md` (**READ FIRST** — Track A harness-on-frontier vs. Track B native WSP models vs. Track B′ custom Mini) and `docs/MODEL_CARDS.md` (fleet identity, verified facts, open gaps). The large 95–100% benchmark table in the root README is a **harness-on-frontier** result, not a score of any Quillan-owned checkpoint. Creator artifacts (books, music, game demo) have primary-source links in the root README's **Creator and verifiable artifacts** section.  Four-donor design: Flagship and Mini receive all four donors (Qwen ~0.6B + Llama ~1B + BitNet 2B-4T + Falcon3 ~1B) **as a group**; Dragon is Falcon3 with an Ollama system message running Quillan's system prompt. Cross-match fix in progress.  The canonical package is the three deployed models — Quillan-Ronin Flagship (~1B), Quillan-Ronin-Mini (~0.8B) and Quillan-Dragon (~1B); the ONI Python sources are the implementation/training package, not the shipped product. Canonical official links (site, social, repos, Ollama, HF, Grokipedia, NotebookLM, DeepWiki, Genius, YouTube/Suno) are in the root README's **Official links** directory. Historical framing is real Japanese history (Edo period, rōnin, bushidō) used as an ethical reference frame — not roleplay, game mechanics, or fantasy lore.

</details>

<!-- QUILLAN-DOCS-PROVENANCE:END -->

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
