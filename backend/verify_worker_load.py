#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sustained 4-thread torch load for all-core verification. Does NOT touch affinity."""

from __future__ import annotations
import json
import sys
import time

import torch


def main() -> None:
    secs = float(sys.argv[1]) if len(sys.argv) > 1 else 12.0
    out = sys.argv[2] if len(sys.argv) > 2 else None
    torch.set_num_threads(4)
    k = torch.randn(512, 512)
    v = torch.randn(512, 512)
    t0 = time.perf_counter()
    iters = 0
    while time.perf_counter() - t0 < secs:
        g = k.T @ k
        g += 0.01 * torch.eye(512)
        v = torch.linalg.solve(g, k.T)
        iters += 1
    elapsed = time.perf_counter() - t0
    result = {
        "iters": iters,
        "elapsed": round(elapsed, 2),
        "rate": round(iters / elapsed, 1),
    }
    if out:
        with open(out, "w", encoding="ascii") as fh:
            fh.write(json.dumps(result))
    print(json.dumps(result))


if __name__ == "__main__":
    main()
