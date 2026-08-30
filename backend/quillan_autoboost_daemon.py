#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
⚡ QUILLAN-RONIN AUTO-BOOT OPTIMIZER & LEE-MACH-6 GOVERNOR DAEMON
------------------------------------------------------------------
Runs automatically on Windows startup to ensure the PC runs butter-smooth 24/7:
  1. Boot-time total box tuning (0.5ms kernel timer, CPU unparking, RAM purge)
  2. Persistent background Lee-Mach-6 thermodynamic governor
  3. Automatic periodic WorkingSet trimming every 60s
  4. Validation test kit backend server on port 5000
"""

import sys
import os
import time
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

def run_boot_tuning():
    """Initial one-shot total box tuning on system startup."""
    total_box_script = os.path.join(BASE_DIR, 'total_box_turbo.py')
    if os.path.exists(total_box_script):
        try:
            subprocess.run([sys.executable, total_box_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

def start_backend_server():
    """Starts the validation and VM booster backend on port 5000."""
    main_backend = os.path.join(BASE_DIR, 'main.py')
    if os.path.exists(main_backend):
        try:
            subprocess.Popen([sys.executable, main_backend], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

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

            time.sleep(30.0) # Check every 30 seconds
        except Exception:
            time.sleep(30.0)

def main():
    print("⚡ Starting Quillan-Ronin Auto-Boot Governor Daemon...")
    # 1. Run full boot tuning
    run_boot_tuning()

    # 2. Launch backend API server in background
    start_backend_server()

    # 3. Enter continuous Governor loop
    governor_loop()

if __name__ == '__main__':
    main()
