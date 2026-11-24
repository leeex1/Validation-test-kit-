#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bench_core_split.py - A/B proof of all-4-core vs reserved-core-0 affinity policy.

FIX 2 (2026-11-22): correct per-core observer (separate thread, 1s interval)
and a FAIR control - pinned3@3threads vs all4@4threads - to separate
"3 vs 4 cores" from OpenMP thread oversubscription.
"""

from __future__ import annotations

import argparse
import os
import statistics
import sys
import threading
import time
from typing import List

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import psutil  # type: ignore[import-untyped]
import torch

BELOW_NORMAL = getattr(psutil, "BELOW_NORMAL_PRIORITY_CLASS", None)
NORMAL = getattr(psutil, "NORMAL_PRIORITY_CLASS", None)


def set_policy(mode: str, nthreads: int) -> List[int]:
    n = psutil.cpu_count(logical=True) or 4
    cores = list(range(1, n)) if mode == "pinned3" else list(range(n))
    p = psutil.Process(os.getpid())
    try:
        p.cpu_affinity(cores)
    except Exception as exc:
        print(f"[warn] affinity failed: {exc}")
    try:
        p.nice(BELOW_NORMAL if mode in ("pinned3", "all4") else NORMAL)
    except Exception:
        pass
    torch.set_num_threads(nthreads)
    return cores


def monitor(stop: threading.Event, samples: List[List[float]]) -> None:
    psutil.cpu_percent(percpu=True)
    while not stop.is_set():
        samples.append(psutil.cpu_percent(interval=1.0, percpu=True))


def jitter_probe(stop: threading.Event, samples: List[float]) -> None:
    period = 0.005
    while not stop.is_set():
        t0 = time.perf_counter()
        time.sleep(period)
        samples.append((time.perf_counter() - t0 - period) * 1000.0)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["pinned3", "all4", "full4"], default="all4")
    ap.add_argument("--seconds", type=float, default=8.0)
    ap.add_argument("--threads", type=int, default=4)
    args = ap.parse_args()

    cores = set_policy(args.mode, args.threads)
    prio = "BELOW_NORMAL" if args.mode in ("pinned3", "all4") else "NORMAL"
    print(
        f"mode={args.mode} cores={cores} torch_threads={args.threads} priority={prio}"
    )

    stop = threading.Event()
    core_samples: List[List[float]] = []
    jit: List[float] = []
    mt = threading.Thread(target=monitor, args=(stop, core_samples), daemon=True)
    jt = threading.Thread(target=jitter_probe, args=(stop, jit), daemon=True)
    mt.start()
    jt.start()

    k = torch.randn(512, 512)
    v = torch.randn(512, 512)
    iters = 0
    t0 = time.perf_counter()
    while time.perf_counter() - t0 < args.seconds:
        g = k.T @ k
        g += 0.01 * torch.eye(512)
        v = torch.linalg.solve(g, k.T)
        iters += 1
    elapsed = time.perf_counter() - t0
    stop.set()
    mt.join(timeout=2)
    jt.join(timeout=2)

    if core_samples:
        n = len(core_samples[0])
        avg = [
            round(sum(s[i] for s in core_samples) / len(core_samples), 1)
            for i in range(n)
        ]
        print(f"per_core_avg: {avg}  (samples={len(core_samples)})")
    if jit:
        js = sorted(jit)
        print(
            f"jitter_ms: n={len(js)} p50={statistics.median(js):.2f} "
            f"p95={js[int(len(js) * 0.95)]:.2f} "
            f"p99={js[min(len(js) - 1, int(len(js) * 0.99))]:.2f}"
        )
    print(f"throughput: {iters / elapsed:.1f} iters/s in {elapsed:.2f}s")


if __name__ == "__main__":
    main()
