#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""UAC self-elevation helper for the Validation-test-kit backend.

Many toolkit tweaks (netsh TCP stack, fsutil NTFS behavior, HKLM MMCSS keys)
need admin rights and otherwise fail silently. This helper detects elevation
at startup and offers a one-click UAC relaunch; declining continues degraded
with honest SKIPPED reports from each script's own returncode checks.
"""

import ctypes
import os
import subprocess
import sys


def is_admin():
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def ensure_admin_or_offer(script_path, pending_items):
    """Returns 'admin' or 'degraded'. Relaunches elevated on user consent."""
    if sys.platform != 'win32' or is_admin():
        return 'admin'
    print('  [privilege] NOT elevated; these will SKIP: %s' % '; '.join(pending_items))
    try:
        ans = input('  Relaunch as administrator to apply everything? [y/N]: ').strip().lower()
    except Exception:
        ans = ''
    if ans in ('y', 'yes'):
        try:
            subprocess.run(
                ['powershell', '-NoProfile', '-Command',
                 "Start-Process -FilePath '%s' -ArgumentList '\"%s\"' -Verb RunAs"
                 % (sys.executable, script_path)])
            print('  Relaunching elevated; this window will exit.')
            raise SystemExit(0)
        except SystemExit:
            raise
        except Exception as e:
            print('  Elevation failed (%s); continuing degraded.' % (e,))
            return 'degraded'
    print('  Continuing degraded (admin-only steps will report SKIPPED).')
    return 'degraded'
