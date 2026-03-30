# Create a Windows-style virtualenv in backend/.venv (Scripts\Activate.ps1).
# Use this if `python` on your PATH is MSYS/MinGW — that build creates `bin/` not `Scripts/`.

$ErrorActionPreference = "Stop"

$candidates = @(
    "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
)

$py = $null
foreach ($c in $candidates) {
    if (Test-Path $c) {
        $py = $c
        break
    }
}

if (-not $py) {
    Write-Error "No Windows Python found under LocalAppData. Install from https://www.python.org/downloads/ (check 'Add to PATH') and retry."
}

Write-Host "Using: $py"
& $py --version

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

if (Test-Path ".venv") {
    Remove-Item -Recurse -Force ".venv"
}

& $py -m venv .venv

if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Error "venv still missing Scripts\Activate.ps1. Is this the MSYS Python? Use only the python.org / Store install."
}

Write-Host ""
Write-Host "Done. Activate with:"
Write-Host "  & .\.venv\Scripts\Activate.ps1"
Write-Host "Then: pip install -r requirements.txt"
