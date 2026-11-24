#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
⚡ QUILLAN-RONIN AUTO-BOOT OPTIMIZER & LEE-MACH-6 GOVERNOR DAEMON
------------------------------------------------------------------
Runs automatically on Windows startup to ensure the PC runs butter-smooth 24/7:
  1. Boot-time total box tuning (0.5ms kernel timer, CPU unparking, RAM purge)
  2. Persistent background Lee-Mach-6 thermodynamic governor
  3. Lightweight self WorkingSet trim (own process only) every 30s when RAM > 75%
  4. Validation test kit backend server on port 5000
  5. CPU spike-tamer: known background hogs pinned to non-UI cores at
     below-normal priority (never idle/global caps — work keeps full speed
     on its cores, interactive UI keeps the rest)
"""

import sys
import os
import time
import json
import ctypes
import subprocess
import threading

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

try:
    import psutil

    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Never flash console windows from this background daemon.
_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# --- CPU SPIKE-TAMER CONFIG (user-tunable) ---------------------------------
# Match by COMMAND LINE substring (never by bare exe name) so IDE/MCP python
# processes (server-github, windows-mcp, articulation hosts) are untouched.
# Add your hogs here as substrings, e.g. 'blender', 'handbrake'.
HOG_MATCH = [
    "train_oni",
    "venv_oni",
    "torchrun",  # Quillan training (sm61 safe)
    "llama",
    "whisper",
    "ffmpeg",  # local AI / media batch work
    # 2026-11-23: model-agent probe/eval/build scripts are sustained CPU batch
    # work. Pin immediately (not after the 90s adaptive window) so core 0 stays
    # free for GUI/DWM. User empirical test: manual 3-core pin smoothed the PC.
    "parametric_probe",
    "latent_structure_probe",
    "probe_layerwise",
    "eval_quillan",
    "judge_sovereign",
    "build_quillan",
    "verify_weights",
    "adapter_diagnostics",
    "cometupdater",
    "epicgameslauncher",  # background launchers/updaters
]
# Never tier these no matter what (OS core, shell, compositor).
PROTECTED_EXE = {
    "system",
    "registry",
    "smss.exe",
    "csrss.exe",
    "services.exe",
    "lsass.exe",
    "wininit.exe",
    "svchost.exe",
    "dwm.exe",
    "explorer.exe",
    # NVIDIA Overlay / audio chain: never demote to BELOW_NORMAL (past audio blips)
    "nvspcap.exe",
    "nvspcap64.exe",
    "nvcontainer.exe",
    "nvidia.overlay.exe",
    "nvidia.webhelper.exe",
}
# --- ADAPTIVE AUTO-TIER (learns hogs instead of only the static list) ------
# Any process SUSTAINING >=HOG_CPU_PCT of one core for HOG_SUSTAIN_LOOPS
# consecutive loops gets tiered like a HOG_MATCH hit — unless exempt.
# Foreground (gaming) process is always exempt; editors/browsers/launchers
# never auto-tier (static list still covers known background batch work).
ADAPTIVE_TIERS = True
HOG_CPU_PCT = 40.0  # % of a single core, sustained
HOG_SUSTAIN_LOOPS = 2  # 2026-11-23 liveness: 2 loops (~30-60s) vs 3 (~90s); release still 20-loop hysteresis
NEVER_AUTO = {
    "brave.exe",
    "chrome.exe",
    "msedge.exe",
    "firefox.exe",
    "zen.exe",
    "code.exe",
    "cursor.exe",
    "antigravity.exe",
    "windsurf.exe",
    "trae.exe",
    "devenv.exe",
    "opencode.exe",
    "steam.exe",
    "steamwebhelper.exe",
    "epicgameslauncher.exe",
    "spotify.exe",
    "discord.exe",
}
_hot = {}  # pid -> [cpu_total, last_seen, create_time, hot_hits, auto_tiered, cool_hits]
CPU_TIER_INTERVAL = 30.0
# Kaido Q4.1: shared per-loop process snapshot (enforce_cpu_tiers + demote_idle_support)
_PROC_SNAP = None
_PROC_SNAP_AT = 0.0

# --- C11-HARMONIA TEAM POLICY -------------------------------------------
# 2026-11-22 (C14-KAIDO): workers use ALL cores at BELOW_NORMAL by default.
# On Windows the scheduler is priority-driven and preemptive: DWM/input/audio
# threads (NORMAL+) preempt a BELOW_NORMAL worker on ANY core, so dedicating
# Core 0 adds no protection. The two causes of the OLD oscillation are already
# fixed: foreground-window detection (:168-176) and 20-loop cool release.
# Core-0 reservation remains available as an instant rollback via the shared
# affinity_policy.json flag (absent/false => legacy 3-core pin).
AFFINITY_POLICY_FILE = os.path.normpath(
    os.path.join(
        BASE_DIR,
        "..",
        "..",
        "..",
        "..",
        "..",
        "07 - Memory & LanceDB",
        "affinity_policy.json",
    )
)


def all_cores_mode() -> bool:
    """Read affinity policy fresh (every loop/call). Absent/corrupt => False (safe)."""
    try:
        if os.path.exists(AFFINITY_POLICY_FILE):
            with open(AFFINITY_POLICY_FILE, "r", encoding="utf-8") as f:
                return json.load(f).get("all_cores_mode") is True
    except Exception:
        pass
    return False


PIN_HOGS_TO_WORKER_CORES = (
    False  # compatibility alias; runtime truth = all_cores_mode()
)
# Hysteresis: an auto-tiered process must stay cool for 20 loops (~10 min)
# before release. One cool sample used to flip it straight back.
HOG_RELEASE_LOOPS = 20
# Publish decisions so the governor reads our policy instead of guessing
# worker placement from Core 0 load.
TEAM_STATE_FILE = os.path.join(BASE_DIR, "tier_state.json")

CPU_LOG = os.path.join(BASE_DIR, "governor_cpu.log")
CPU_LOG_MAX_BYTES = (
    512 * 1024
)  # C13-WARDEN: bound the perimeter, rotate before unbounded growth
ULTIMATE_GUID = "fc698e3d-7323-4884-a632-ed97a464f85a"  # C19-VIGIL: covenant anchor (machine-local Ultimate duplicate)
STATE_FILE = os.path.join(
    BASE_DIR, "governor_state.json"
)  # C5-ECHO: memory across restarts


def run_boot_tuning():
    """Initial one-shot total box tuning on system startup."""
    total_box_script = os.path.join(BASE_DIR, "total_box_turbo.py")
    if os.path.exists(total_box_script):
        try:
            subprocess.run(
                [sys.executable, total_box_script],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=_NO_WINDOW,
                timeout=45,  # MIN-MAX 2026-11-22: a hung boot child must
                # never block governor_loop() from starting.
            )
        except subprocess.TimeoutExpired:
            _log_cpu("boot tuning timed out after 45s; continuing to governor loop")
        except Exception:
            pass


def start_backend_server():
    """Starts the validation and VM booster backend on port 5000."""
    main_backend = os.path.join(BASE_DIR, "main.py")
    if os.path.exists(main_backend):
        try:
            subprocess.Popen(
                [sys.executable, main_backend],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=_NO_WINDOW,
            )
        except Exception:
            pass


def _log_cpu(msg):
    try:
        if os.path.exists(CPU_LOG) and os.path.getsize(CPU_LOG) > CPU_LOG_MAX_BYTES:
            os.replace(CPU_LOG, CPU_LOG + ".1")
        with open(CPU_LOG, "a", encoding="utf-8") as f:
            f.write(time.strftime("%Y-%m-%d %H:%M:%S ") + msg + "\n")
    except Exception:
        pass


def _foreground_pid():
    """PID owning the foreground window (gaming/interactive) — always exempt."""
    try:
        hwnd = ctypes.windll.user32.GetForegroundWindow()
        pid = ctypes.c_ulong(0)
        ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        return int(pid.value) or None
    except Exception:
        return None


def _tier_proc(p, hog_cores, tag, dry_run=False):
    """Apply (or preview) below-normal + reserved-core tiering. Returns True if changed."""
    try:
        if dry_run:
            try:
                cur_aff = sorted(p.cpu_affinity()) if hasattr(p, "cpu_affinity") else []
            except Exception:
                cur_aff = []
            print(
                "would tier pid=%s name=%s prio=%s affinity=%s -> cores%r/below-normal [%s]"
                % (p.pid, p.info.get("name"), p.nice(), cur_aff, hog_cores, tag)
            )
            return False
        changed = []
        try:
            if p.nice() != psutil.BELOW_NORMAL_PRIORITY_CLASS:
                p.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
                changed.append("prio->below-normal")
        except Exception:
            pass
        # Only pin cores in legacy mode; all_cores_mode leaves affinity at OS
        # default so the scheduler can spread worker threads across all cores.
        if not all_cores_mode():
            try:
                if hasattr(p, "cpu_affinity") and set(p.cpu_affinity()) != set(
                    hog_cores
                ):
                    p.cpu_affinity(hog_cores)
                    changed.append("affinity->cores%r" % (hog_cores,))
            except Exception:
                pass
        if changed:
            _log_cpu(
                "tiered pid=%s name=%s %s [%s]"
                % (p.pid, p.info.get("name"), " ".join(changed), tag)
            )
            return True
        return False
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return False


def _release_proc(p, n):
    """Release a cooled-down auto-tier. Priority only unless affinity pinning is enabled."""
    try:
        p.nice(psutil.NORMAL_PRIORITY_CLASS)
        # Always restore full affinity on release so a legacy pin never lingers.
        if hasattr(p, "cpu_affinity"):
            p.cpu_affinity(list(range(n)))
        _log_cpu("released pid=%s name=%s (cooled down)" % (p.pid, p.info.get("name")))
    except Exception:
        pass


def release_legacy_affinity():
    """One-time migration: undo affinity masks left by the old pinned policy.

    The retired policy pinned hogs to cores 1..3. New policy is priority-only,
    so any surviving restricted mask must be restored to all cores or the
    throughput fix would never take effect on already-running processes.
    """
    # Run migration when all-cores is active: undo any legacy 3-core masks left
    # on processes from before the policy flip. In legacy mode, do nothing
    # (pinning is intentional there).
    if not all_cores_mode() or not PSUTIL_AVAILABLE or sys.platform != "win32":
        return
    try:
        n = psutil.cpu_count() or 4
        all_cores = list(range(n))
        for p in psutil.process_iter(["pid", "name"]):
            try:
                pid = p.info.get("pid") or 0
                if pid in (0, 4, os.getpid()):
                    continue
                if not hasattr(p, "cpu_affinity"):
                    continue
                if len(p.cpu_affinity()) < n:
                    p.cpu_affinity(all_cores)
                    _log_cpu(
                        "migrated pid=%s name=%s affinity restored to all cores"
                        % (pid, p.info.get("name"))
                    )
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
            except Exception:
                continue
    except Exception:
        pass


def _shared_proc_snapshot():
    """Kaido Q4.1: ONE name-only process scan shared by the two per-loop passes.

    enforce_cpu_tiers() and demote_idle_support() previously each did a full
    process_iter(["pid","name"]) (~357ms at 283 procs). A short TTL lets both
    consume one snapshot. cmdline is fetched lazily per candidate and cached.
    Returns list of [Process, pid, name_lower, cmd_or_None].
    """
    global _PROC_SNAP, _PROC_SNAP_AT
    now = time.time()
    if _PROC_SNAP is not None and (now - _PROC_SNAP_AT) < 3.0:
        return _PROC_SNAP
    snap = []
    try:
        for p in psutil.process_iter(["pid", "name"]):
            snap.append(
                [
                    p,
                    p.info.get("pid") or 0,
                    (p.info.get("name") or "").lower(),
                    None,  # lazy cmdline cache
                ]
            )
    except Exception:
        snap = []
    _PROC_SNAP, _PROC_SNAP_AT = snap, now
    return snap


def _snap_cmd(entry):
    """Lazily fetch + cache cmdline for a snapshot entry (empty on failure)."""
    if entry[3] is None:
        try:
            entry[3] = " ".join(entry[0].cmdline() or []).lower()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            entry[3] = ""
        except Exception:
            entry[3] = ""
    return entry[3]


def demote_idle_support(dry_run=False):
    """2026-11-23: demote IDLE MCP/support processes to BELOW_NORMAL priority.

    Rationale (measured A/B): 17 idle MCP node/python procs sitting at Normal
    priority on all cores caused erratic worker throughput (288-353 iters/s) and
    an occasional 38ms GUI wake spike. BELOW_NORMAL (no affinity change) gave
    stable 383-387 iters/s with 16ms wake. Governor MCP independently recommends
    BELOW_NORMAL for background. Only touches LOW-CPU support processes, never
    the foreground window, active hogs, daemons, or the current process.
    Gated by support_demote.json (default ON; {"enabled": false} disables).
    """
    if not PSUTIL_AVAILABLE or sys.platform != "win32":
        return
    try:
        pf = os.path.join(BASE_DIR, "support_demote.json")
        if os.path.exists(pf):
            with open(pf, "r", encoding="utf-8") as f:
                if json.load(f).get("enabled") is False:
                    return
    except Exception:
        pass  # default ON
    if dry_run:
        return
    me = os.getpid()
    fg = _foreground_pid()
    changed = []
    try:
        # Kaido Q4.1: consume shared snapshot (single scan per loop).
        for entry in _shared_proc_snapshot():
            try:
                p, pid, name, _ = entry
                if pid in (0, 4, me) or pid == fg:
                    continue
                if name not in ("node.exe", "python.exe", "pythonw.exe", "conhost.exe"):
                    continue
                cmd = _snap_cmd(entry)
                # Only MCP/support infrastructure, not model jobs or daemons.
                is_support = "mcp" in cmd or "node_modules" in cmd or "conhost" in cmd
                if not is_support:
                    continue
                if any(k in cmd for k in HOG_MATCH) or any(
                    k in cmd
                    for k in (
                        "quillan_autoboost_daemon",
                        "quillan_governor_daemon",
                        "latent_",
                        "parametric_probe",
                        "eval_quillan",
                        "judge_",
                    )
                ):
                    continue
                if p.nice() != psutil.BELOW_NORMAL_PRIORITY_CLASS:
                    p.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
                    changed.append(pid)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
            except Exception:
                continue
    except Exception:
        pass
    if changed:
        _log_cpu(
            "demoted idle support -> below-normal: %s"
            % ",".join(map(str, changed[:12]))
        )


def enforce_cpu_tiers(dry_run=False):
    """Pin known background hogs to non-UI cores at below-normal priority.

    Below-normal (not idle): spikes stop saturating the interactive cores
    while the work itself keeps full speed on its reserved cores.
    Logs only on actual change; never raises (daemon must not die).
    dry_run=True (C32-AEON): preview matches without applying anything.
    """
    if not PSUTIL_AVAILABLE or sys.platform != "win32":
        return
    try:
        n = psutil.cpu_count() or 4
        # ALL cores for workers by default; legacy 3-core pin only when flag off.
        hog_cores = list(range(n)) if all_cores_mode() else (list(range(1, n)) or [0])
        me = os.getpid()
        fg = _foreground_pid()
        now = time.time()
        seen = set()
        # Kaido Q4.1: consume shared snapshot; no second process_iter.
        _SCAN_NAMES = {
            "node.exe",
            "python.exe",
            "pythonw.exe",
            "powershell.exe",
            "pwsh.exe",
            "conhost.exe",
            "cmd.exe",
            "ollama.exe",
            "ollama app.exe",
            "ffmpeg.exe",
            "llama-cli.exe",
            "llama-server.exe",
            "whisper.exe",
            "train_oni.exe",
            "torchrun.exe",
            "python3.exe",
        }
        for entry in _shared_proc_snapshot():
            try:
                p, pid, name, _ = entry
                if pid in (0, 4) or pid == me:
                    continue
                seen.add(pid)
                if name in PROTECTED_EXE:
                    continue
                # Lazy shared cmdline: only candidates pay the cost, cached across
                # both passes. Adaptive path uses name/pid/cpu for non-candidates.
                if name not in _SCAN_NAMES and not any(
                    k.split(".")[0] in name for k in HOG_MATCH
                ):
                    cmd = ""
                else:
                    cmd = _snap_cmd(entry)
                # 1) Static seed list: tier immediately.
                if any(k in cmd for k in HOG_MATCH):
                    _tier_proc(p, hog_cores, "static", dry_run)
                    _hot.pop(pid, None)
                    continue
                # 2) Adaptive: sustained hot + not exempt -> tier; cooled -> release.
                if not ADAPTIVE_TIERS or dry_run:
                    continue
                if pid == fg or name in NEVER_AUTO:
                    _hot.pop(pid, None)
                    continue
                try:
                    ctime = p.create_time()
                    t = p.cpu_times()
                    tot = t.user + t.system
                except Exception:
                    continue
                prev = _hot.get(pid)
                if not prev or prev[2] != ctime:
                    _hot[pid] = [tot, now, ctime, 0, False, 0]
                    continue
                if len(prev) < 6:
                    prev.extend([0] * (6 - len(prev)))  # upgrade pre-team state
                dt = max(now - prev[1], 0.001)
                pct = (tot - prev[0]) / dt * 100.0  # % of one core
                prev[0], prev[1] = tot, now
                if pct >= HOG_CPU_PCT:
                    prev[5] = 0  # hot again -> cancel cool-down
                    prev[3] += 1
                    if prev[3] >= HOG_SUSTAIN_LOOPS and not prev[4]:
                        if _tier_proc(p, hog_cores, "auto", dry_run):
                            prev[4] = True
                            _log_cpu(
                                "auto-tiered pid=%s name=%s sustained %.0f%% core"
                                % (pid, p.info.get("name"), pct)
                            )
                        else:
                            prev[4] = True  # already tiered (e.g. manually)
                elif pct < HOG_CPU_PCT / 2.0:
                    if prev[4]:
                        prev[5] += 1
                        if prev[5] >= HOG_RELEASE_LOOPS:
                            _release_proc(p, n)
                            prev[3], prev[4], prev[5] = 0, False, 0
                    else:
                        prev[3] = 0
                # Between 20% and 40%: hold state — no flip-flop.
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        # Prune dead PIDs so the table can't grow without bound.
        for dead in [k for k in _hot if k not in seen]:
            _hot.pop(dead, None)
        if len(_hot) > 512:
            for k in list(_hot)[: len(_hot) - 512]:
                _hot.pop(k, None)
        # C11-HARMONIA: publish policy so the governor daemon reads our
        # decision instead of inferring it from Core 0 load.
        try:
            with open(TEAM_STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "ts": now,
                        "priority_only": all_cores_mode(),
                        "auto_tiered_pids": [k for k, v in _hot.items() if v[4]],
                    },
                    f,
                )
        except Exception:
            pass
    except Exception:
        pass


def _load_state():
    """C5-ECHO: recall last run's trace across restarts."""
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            st = json.load(f)
            return st if isinstance(st, dict) else {}
    except Exception:
        return {}


def _save_state(st):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(st, f, indent=2)
    except Exception:
        pass


POWER_PLAN_OPTOUT = os.path.join(BASE_DIR, "power_plan_optout.json")


def vigil_power_check():
    """C19-VIGIL Anchor Loop: re-assert Ultimate plan if anything drifted it.

    MIN-MAX 2026-11-20: honour an explicit opt-out. Create
    power_plan_optout.json with {"release_control": true} to allow an
    intentional power-plan change to persist. Default is unchanged (locked).
    """
    try:
        if os.path.exists(POWER_PLAN_OPTOUT):
            with open(POWER_PLAN_OPTOUT, "r", encoding="utf-8") as f:
                if json.load(f).get("release_control") is True:
                    return True
    except Exception:
        pass
    try:
        out = subprocess.run(
            ["powercfg", "/getactivescheme"],
            capture_output=True,
            text=True,
            timeout=10,
            creationflags=_NO_WINDOW,
        )
        if ULTIMATE_GUID.lower() not in (out.stdout or "").lower():
            subprocess.run(
                ["powercfg", "/setactive", ULTIMATE_GUID],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=15,
                creationflags=_NO_WINDOW,
            )
            _log_cpu("vigil: power plan drifted, re-asserted Ultimate")
            return False
        return True
    except Exception:
        return True


def _another_daemon_running():
    """Singleton guard: refuse to start if a live daemon already exists."""
    if not PSUTIL_AVAILABLE:
        return False
    me = os.getpid()
    try:
        for p in psutil.process_iter(["pid", "name", "cmdline"]):
            try:
                if p.info.get("pid") in (None, me):
                    continue
                cmd = " ".join(p.info.get("cmdline") or [])
                if (
                    "quillan_autoboost_daemon" in cmd
                    and "python" in (p.info.get("name") or "").lower()
                ):
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except Exception:
        return False
    return False


def governor_loop():
    """Continuous lightweight Lee-Mach-6 Governor monitoring loop (0.1% CPU)."""
    # NOTE: timeBeginPeriod(1) was removed 2026-11-13 — forcing a 1ms global
    # timer resolution system-wide multiplies DPC/interrupt load and causes
    # stutter + CPU burn on 4c/4t CPUs. A 30s polling daemon needs no timer boost.
    loop_count = 0

    while True:
        try:
            if PSUTIL_AVAILABLE:
                mem = psutil.virtual_memory()
                # If memory utilization is above 75%, trim ONLY this process' working set.
                # (Was EmptyWorkingSet(-1) = system-wide purge -> page-fault storms and
                # heavy stutter. Own-process trim is the documented intent.)
                if mem.percent > 75.0 and sys.platform == "win32":
                    ctypes.windll.psapi.EmptyWorkingSet(
                        ctypes.windll.kernel32.GetCurrentProcess()
                    )

                # CPU spike-tamer: tier background hogs every loop
                enforce_cpu_tiers()
                demote_idle_support()  # 2026-11-23: stabilize throughput/GUI latency

                # VIGIL anchor + state trace: every 10th loop (~5 min) instead of
                # every 30s — powercfg subprocess every 30s burned measurable CPU.
                if loop_count % 10 == 0:
                    vigil_power_check()
                    st = _load_state()
                    st["last_loop"] = time.time()
                    _save_state(st)
                loop_count += 1

            time.sleep(30.0)  # Check every 30 seconds
        except Exception:
            time.sleep(30.0)


def main():
    print("⚡ Starting Quillan-Ronin Auto-Boot Governor Daemon...")
    if "--dry-run" in sys.argv:
        print("[AEON dry-run] CPU tier pass preview (nothing applied):")
        enforce_cpu_tiers(dry_run=True)
        return
    if "--force" not in sys.argv and _another_daemon_running():
        print(
            "Another governor daemon is already running; refusing duplicate (use --force to override)."
        )
        _log_cpu("singleton: duplicate launch refused")
        return
    st = _load_state()
    st["boot_count"] = int(st.get("boot_count", 0)) + 1
    st["last_boot"] = time.time()
    _save_state(st)
    # 1. Run full boot tuning
    run_boot_tuning()

    # 2. Launch backend API server in background
    start_backend_server()

    # 3. One-time migration: restore all cores from the retired pinning policy
    release_legacy_affinity()

    # 4. Enter continuous Governor loop
    governor_loop()


if __name__ == "__main__":
    main()
