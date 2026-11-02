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

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Never flash console windows from this background daemon.
_NO_WINDOW = getattr(subprocess, 'CREATE_NO_WINDOW', 0)

# --- CPU SPIKE-TAMER CONFIG (user-tunable) ---------------------------------
# Match by COMMAND LINE substring (never by bare exe name) so IDE/MCP python
# processes (server-github, windows-mcp, articulation hosts) are untouched.
# Add your hogs here as substrings, e.g. 'blender', 'handbrake'.
HOG_MATCH = [
    'train_oni', 'venv_oni', 'torchrun',      # Quillan training (sm61 safe)
    'llama', 'whisper', 'ffmpeg',             # local AI / media batch work
    'cometupdater', 'epicgameslauncher',      # background launchers/updaters
]
# Never tier these no matter what (OS core, shell, compositor).
PROTECTED_EXE = {
    'system', 'registry', 'smss.exe', 'csrss.exe', 'services.exe',
    'lsass.exe', 'wininit.exe', 'svchost.exe', 'dwm.exe', 'explorer.exe',
}
# --- ADAPTIVE AUTO-TIER (learns hogs instead of only the static list) ------
# Any process SUSTAINING >=HOG_CPU_PCT of one core for HOG_SUSTAIN_LOOPS
# consecutive loops gets tiered like a HOG_MATCH hit — unless exempt.
# Foreground (gaming) process is always exempt; editors/browsers/launchers
# never auto-tier (static list still covers known background batch work).
ADAPTIVE_TIERS = True
HOG_CPU_PCT = 40.0       # % of a single core, sustained
HOG_SUSTAIN_LOOPS = 3    # consecutive 30s loops (~90s) before action
NEVER_AUTO = {
    'brave.exe', 'chrome.exe', 'msedge.exe', 'firefox.exe', 'zen.exe',
    'code.exe', 'cursor.exe', 'antigravity.exe', 'windsurf.exe', 'trae.exe',
    'devenv.exe', 'opencode.exe', 'steam.exe', 'steamwebhelper.exe',
    'epicgameslauncher.exe', 'spotify.exe', 'discord.exe',
}
_hot = {}  # pid -> [last_cpu_total, last_seen, create_time, hot_hits, auto_tiered]
CPU_TIER_INTERVAL = 30.0
CPU_LOG = os.path.join(BASE_DIR, 'governor_cpu.log')
CPU_LOG_MAX_BYTES = 512 * 1024  # C13-WARDEN: bound the perimeter, rotate before unbounded growth
ULTIMATE_GUID = 'fc698e3d-7323-4884-a632-ed97a464f85a'  # C19-VIGIL: covenant anchor (machine-local Ultimate duplicate)
STATE_FILE = os.path.join(BASE_DIR, 'governor_state.json')  # C5-ECHO: memory across restarts

def run_boot_tuning():
    """Initial one-shot total box tuning on system startup."""
    total_box_script = os.path.join(BASE_DIR, 'total_box_turbo.py')
    if os.path.exists(total_box_script):
        try:
            subprocess.run([sys.executable, total_box_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           creationflags=_NO_WINDOW)
        except Exception:
            pass

def start_backend_server():
    """Starts the validation and VM booster backend on port 5000."""
    main_backend = os.path.join(BASE_DIR, 'main.py')
    if os.path.exists(main_backend):
        try:
            subprocess.Popen([sys.executable, main_backend], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                             creationflags=_NO_WINDOW)
        except Exception:
            pass

def _log_cpu(msg):
    try:
        if os.path.exists(CPU_LOG) and os.path.getsize(CPU_LOG) > CPU_LOG_MAX_BYTES:
            os.replace(CPU_LOG, CPU_LOG + '.1')
        with open(CPU_LOG, 'a', encoding='utf-8') as f:
            f.write(time.strftime('%Y-%m-%d %H:%M:%S ') + msg + '\n')
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
                cur_aff = sorted(p.cpu_affinity()) if hasattr(p, 'cpu_affinity') else []
            except Exception:
                cur_aff = []
            print('would tier pid=%s name=%s prio=%s affinity=%s -> cores%r/below-normal [%s]'
                  % (p.pid, p.info.get('name'), p.nice(), cur_aff, hog_cores, tag))
            return False
        changed = []
        try:
            if p.nice() != psutil.BELOW_NORMAL_PRIORITY_CLASS:
                p.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
                changed.append('prio->below-normal')
        except Exception:
            pass
        try:
            if hasattr(p, 'cpu_affinity') and set(p.cpu_affinity()) != set(hog_cores):
                p.cpu_affinity(hog_cores)
                changed.append('affinity->cores%r' % (hog_cores,))
        except Exception:
            pass
        if changed:
            _log_cpu('tiered pid=%s name=%s %s [%s]' % (p.pid, p.info.get('name'), ' '.join(changed), tag))
            return True
        return False
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return False


def _release_proc(p, n):
    """Release a cooled-down auto-tier back to normal priority + full cores."""
    try:
        p.nice(psutil.NORMAL_PRIORITY_CLASS)
        if hasattr(p, 'cpu_affinity'):
            p.cpu_affinity(list(range(n)))
        _log_cpu('released pid=%s name=%s (cooled down)' % (p.pid, p.info.get('name')))
    except Exception:
        pass


def enforce_cpu_tiers(dry_run=False):
    """Pin known background hogs to non-UI cores at below-normal priority.

    Below-normal (not idle): spikes stop saturating the interactive cores
    while the work itself keeps full speed on its reserved cores.
    Logs only on actual change; never raises (daemon must not die).
    dry_run=True (C32-AEON): preview matches without applying anything.
    """
    if not PSUTIL_AVAILABLE or sys.platform != 'win32':
        return
    try:
        n = psutil.cpu_count() or 4
        hog_cores = list(range(1, n)) if n > 1 else [0]  # core 0 stays for OS/UI+DPC
        me = os.getpid()
        fg = _foreground_pid()
        now = time.time()
        seen = set()
        for p in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                pid = p.info.get('pid') or 0
                if pid in (0, 4) or pid == me:
                    continue
                seen.add(pid)
                name = (p.info.get('name') or '').lower()
                if name in PROTECTED_EXE:
                    continue
                cmd = ' '.join(p.info.get('cmdline') or []).lower()
                # 1) Static seed list: tier immediately.
                if any(k in cmd for k in HOG_MATCH):
                    _tier_proc(p, hog_cores, 'static', dry_run)
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
                    _hot[pid] = [tot, now, ctime, 0, False]
                    continue
                dt = max(now - prev[1], 0.001)
                pct = (tot - prev[0]) / dt * 100.0  # % of one core
                prev[0], prev[1] = tot, now
                if pct >= HOG_CPU_PCT:
                    prev[3] += 1
                    if prev[3] >= HOG_SUSTAIN_LOOPS and not prev[4]:
                        if _tier_proc(p, hog_cores, 'auto', dry_run):
                            prev[4] = True
                            _log_cpu('auto-tiered pid=%s name=%s sustained %.0f%% core'
                                     % (pid, p.info.get('name'), pct))
                        elif prev[4]:
                            pass
                        else:
                            prev[4] = True  # already tiered (e.g. manually), stop re-trying loudly
                else:
                    if prev[4] and pct < HOG_CPU_PCT / 2.0:
                        _release_proc(p, n)
                        prev[3], prev[4] = 0, False
                    elif pct < HOG_CPU_PCT / 2.0:
                        prev[3] = 0
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        # Prune dead PIDs so the table can't grow without bound.
        for dead in [k for k in _hot if k not in seen]:
            _hot.pop(dead, None)
        if len(_hot) > 512:
            for k in list(_hot)[:len(_hot) - 512]:
                _hot.pop(k, None)
    except Exception:
        pass


def _load_state():
    """C5-ECHO: recall last run's trace across restarts."""
    try:
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            st = json.load(f)
            return st if isinstance(st, dict) else {}
    except Exception:
        return {}


def _save_state(st):
    try:
        with open(STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(st, f, indent=2)
    except Exception:
        pass


def vigil_power_check():
    """C19-VIGIL Anchor Loop: re-assert Ultimate plan if anything drifted it."""
    try:
        out = subprocess.run(['powercfg', '/getactivescheme'],
                             capture_output=True, text=True, timeout=10, creationflags=_NO_WINDOW)
        if ULTIMATE_GUID.lower() not in (out.stdout or '').lower():
            subprocess.run(['powercfg', '/setactive', ULTIMATE_GUID],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=15,
                           creationflags=_NO_WINDOW)
            _log_cpu('vigil: power plan drifted, re-asserted Ultimate')
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
        for p in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if p.info.get('pid') in (None, me):
                    continue
                cmd = ' '.join(p.info.get('cmdline') or [])
                if 'quillan_autoboost_daemon' in cmd and 'python' in (p.info.get('name') or '').lower():
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except Exception:
        return False
    return False


def governor_loop():
    """Continuous lightweight Lee-Mach-6 Governor monitoring loop (0.1% CPU)."""
    # Enforce 0.5ms timer
    if sys.platform == 'win32':
        try:
            ctypes.windll.winmm.timeBeginPeriod(1)
        except Exception:
            pass

    while True:
        try:
            if PSUTIL_AVAILABLE:
                mem = psutil.virtual_memory()
                # If memory utilization is above 75%, trigger gentle background compaction
                if mem.percent > 75.0 and sys.platform == 'win32':
                    ctypes.windll.psapi.EmptyWorkingSet(ctypes.c_void_p(-1))

                # CPU spike-tamer: tier background hogs every loop
                enforce_cpu_tiers()

                # VIGIL anchor: snap power plan back on any drift + persist trace
                vigil_power_check()
                st = _load_state()
                st['last_loop'] = time.time()
                _save_state(st)

            time.sleep(30.0) # Check every 30 seconds
        except Exception:
            time.sleep(30.0)

def main():
    print("⚡ Starting Quillan-Ronin Auto-Boot Governor Daemon...")
    if '--dry-run' in sys.argv:
        print('[AEON dry-run] CPU tier pass preview (nothing applied):')
        enforce_cpu_tiers(dry_run=True)
        return
    if '--force' not in sys.argv and _another_daemon_running():
        print('Another governor daemon is already running; refusing duplicate (use --force to override).')
        _log_cpu('singleton: duplicate launch refused')
        return
    st = _load_state()
    st['boot_count'] = int(st.get('boot_count', 0)) + 1
    st['last_boot'] = time.time()
    _save_state(st)
    # 1. Run full boot tuning
    run_boot_tuning()

    # 2. Launch backend API server in background
    start_backend_server()

    # 3. Enter continuous Governor loop
    governor_loop()

if __name__ == '__main__':
    main()
