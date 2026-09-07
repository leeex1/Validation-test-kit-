# Quillan Auto-Boost Daemon - Windows Startup Installation
# Installs the daemon as a scheduled task for 24/7 operation

$ErrorActionPreference = "Stop"

$DaemonPath = "C:\02_QUILLAN\09 - Projects\projects\testing\Validation-test-kit\backend\quillan_autoboost_daemon.py"
$PythonExe  = (Get-Command python.exe -ErrorAction SilentlyContinue)?.Source
$TaskName   = "QuillanAutoboostDaemon"

if (-not $PythonExe) {
    # Fallback to standard Python installs
    $Candidates = @(
        "$env:LOCALAPPDATA\Programs\Python\Python*\python.exe",
        "C:\Python*\python.exe",
        "C:\Program Files\Python*\python.exe"
    )
    foreach ($Pattern in $Candidates) {
        $Found = Get-Item $Pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($Found) { $PythonExe = $Found.FullName; break }
    }
}

if (-not $PythonExe) {
    Write-Host "[-] Python not found on PATH. Install Python or add to PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[+] Python executable: $PythonExe" -ForegroundColor Green
Write-Host "[+] Daemon script:    $DaemonPath" -ForegroundColor Green

# Remove existing task if present
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create action
$Action = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument "`"$DaemonPath`" --daemon" `
    -WorkingDirectory "C:\02_QUILLAN\09 - Projects\projects\testing\Validation-test-kit\backend"

# Create trigger (at startup, with delay to allow system to stabilize)
$Trigger = New-ScheduledTaskTrigger `
    -AtStartup `
    -RandomDelay (New-TimeSpan -Minutes 2)

# Create principal (run with highest privileges)
$Principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

# Create settings
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5) `
    -ExecutionTimeLimit (New-TimeSpan -Days 365)

# Register the task
Write-Host "Registering scheduled task..." -ForegroundColor Yellow
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Principal $Principal `
    -Settings $Settings `
    -Description "Quillan-Ronin Auto-Boost Governor Daemon - 24/7 system optimization" `
    -Force

Write-Host "✓ Task registered successfully!" -ForegroundColor Green

# Verify task
$Task = Get-ScheduledTask -TaskName $TaskName
Write-Host "`nTask Details:" -ForegroundColor Cyan
Write-Host "  Name: $($Task.TaskName)" -ForegroundColor White
Write-Host "  State: $($Task.State)" -ForegroundColor White
Write-Host "  Run As: $($Task.Principal.UserId)" -ForegroundColor White
Write-Host "  Trigger: At startup with random delay" -ForegroundColor White

Write-Host ""
Write-Host "=== INSTALLATION COMPLETE ===" -ForegroundColor Green
Write-Host "Daemon installed for automatic startup"
