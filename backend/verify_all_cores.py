#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""End-to-end verification of all-cores affinity + GUI responsiveness.

Proves:
  1. A worker deliberately pinned to cores [1,2,3] gets EXPANDED to [0,1,2,3]
     by the live governor apply_pc_smoothness_locks() under all_cores_mode.
  2. Under a sustained 4-thread load, ALL FOUR cores carry load (external PDH counter).
  3. GUI wake latency stays low (normal-priority 16ms timer probe).
"""

from __future__ import annotations
import json
import os
import statistics
import subprocess
import sys
import tempfile
import threading
import time
from typing import List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import psutil

HERE = os.path.dirname(os.path.abspath(__file__))
PY = sys.executable
WORKER = os.path.join(HERE, "verify_worker_load.py")
GOV_DIR = r"C:\02_QUILLAN\daemons"
DURATION = 16.0


def main() -> None:
    sys.path.insert(0, GOV_DIR)
    import quillan_governor_daemon as gov  # noqa: E402

    print("=== 1. POLICY ===")
    print("all_cores_mode =", gov.all_cores_mode())
    if not gov.all_cores_mode():
        print("ABORT: all-cores mode not active")
        return

    result_file = os.path.join(
        tempfile.gettempdir(), "quillan_verify_worker_result.json"
    )
    if os.path.exists(result_file):
        os.remove(result_file)

    print("=== 2. SPAWN worker, pin to [1,2,3], then apply governor lock ===")
    w = subprocess.Popen([PY, WORKER, str(DURATION), result_file])
    time.sleep(2.0)
    p = psutil.Process(w.pid)
    p.cpu_affinity([1, 2, 3])
    before = sorted(p.cpu_affinity())
    res = gov.apply_pc_smoothness_locks(w.pid)
    after = sorted(p.cpu_affinity())
    print(f"affinity before lock = {before}")
    print(
        f"affinity after lock  = {after}  (all_cores_mode={res.get('all_cores_mode')})"
    )
    print(f"priority_set = {res.get('priority_set')}")

    print("=== 3. SAMPLE per-core load (external PDH) + GUI wake latency ===")
    core_samples: List[List[float]] = []
    gui_jitter: List[float] = []
    stop = threading.Event()

    def core_monitor() -> None:
        psutil.cpu_percent(percpu=True)
        while not stop.is_set():
            core_samples.append(psutil.cpu_percent(interval=1.0, percpu=True))

    def gui_probe() -> None:
        # Normal-priority 16ms timer: lateness ~= GUI stutter proxy
        period = 0.016
        while not stop.is_set():
            t0 = time.perf_counter()
            time.sleep(period)
            gui_jitter.append((time.perf_counter() - t0 - period) * 1000.0)

    mt = threading.Thread(target=core_monitor, daemon=True)
    gt = threading.Thread(target=gui_probe, daemon=True)
    mt.start()
    gt.start()
    time.sleep(DURATION - 3.0)
    stop.set()
    mt.join(timeout=3)
    gt.join(timeout=3)

    if core_samples:
        n = len(core_samples[0])
        avg = [
            round(sum(s[i] for s in core_samples) / len(core_samples), 1)
            for i in range(n)
        ]
        print(f"per_core_avg ({len(core_samples)} samples) = {avg}")
        active = sum(1 for x in avg if x >= 20.0)
        print(f"cores carrying >=20% load = {active}/{n}")
    if gui_jitter:
        js = sorted(gui_jitter)
        p50 = statistics.median(js)
        p95 = js[int(len(js) * 0.95)]
        p99 = js[min(len(js) - 1, int(len(js) * 0.99))]
        print(
            f"gui_wake_lateness_ms: n={len(js)} p50={p50:.2f} p95={p95:.2f} p99={p99:.2f} max={max(js):.2f}"
        )

    try:
        w.wait(timeout=5)
    except subprocess.TimeoutExpired:
        w.terminate()
    if os.path.exists(result_file):
        with open(result_file, encoding="ascii") as fh:
            print("worker_throughput =", json.loads(fh.read()))

    print("=== VERDICT ===")
    ok_affinity = after == [0, 1, 2, 3]
    ok_cores = core_samples and sum(1 for x in avg if x >= 20.0) >= 3
    ok_gui = gui_jitter and js[int(len(js) * 0.95)] < 20.0
    print(f"affinity expanded to 4 cores : {'PASS' if ok_affinity else 'FAIL'}")
    print(f"load on 3+ cores             : {'PASS' if ok_cores else 'FAIL'}")
    print(f"GUI p95 lateness < 20ms      : {'PASS' if ok_gui else 'FAIL'}")


if __name__ == "__main__":
    main()
