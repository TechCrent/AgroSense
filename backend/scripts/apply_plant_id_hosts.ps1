<#
.SYNOPSIS
  Append a static mapping for api.plant.id to the Windows hosts file (local DNS override).

.DESCRIPTION
  Use when your default DNS cannot resolve api.plant.id. Obtain the current A record from a
  working network once, then run this script with that IPv4 address.
  See docs/LOCAL_DEV_DNS_WINDOWS.md

  -PrintLine works without Administrator (prints the line to paste into hosts manually).
  Writes require Administrator; use "Run as administrator" PowerShell or Notepad-as-admin.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\apply_plant_id_hosts.ps1 -IpAddress "104.248.195.139" -PrintLine
  powershell -ExecutionPolicy Bypass -File .\apply_plant_id_hosts.ps1 -IpAddress "104.248.195.139" -WhatIf
  # Elevated session:
  powershell -ExecutionPolicy Bypass -File .\apply_plant_id_hosts.ps1 -IpAddress "104.248.195.139"
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$IpAddress,

    [switch]$WhatIf,

    [switch]$PrintLine
)

$ErrorActionPreference = "Stop"
$hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
$hostname = "api.plant.id"
$comment = "# AgroSense local dev - see docs/LOCAL_DEV_DNS_WINDOWS.md"

if ($IpAddress -notmatch '^\d{1,3}(\.\d{1,3}){3}$') {
    Write-Error "IpAddress must be dotted IPv4, got: $IpAddress"
}

$line = "$IpAddress`t$hostname`t$comment"

if ($PrintLine) {
    Write-Host "Add this line to (as Administrator): $hostsPath"
    Write-Host ""
    Write-Host $line
    Write-Host ""
    Write-Host "Tip: Notepad -> Run as administrator -> File -> Open -> All files -> open hosts, paste, save."
    Write-Host "Then: ipconfig /flushdns"
    Write-Host "Verify HTTPS (ping may time out if ICMP is blocked):"
    Write-Host "  Test-NetConnection $hostname -Port 443"
    exit 0
}

function Test-IsAdministrator {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $p = [Security.Principal.WindowsPrincipal]$id
    return $p.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

$raw = Get-Content -Path $hostsPath -Raw -Encoding Default
if ($null -eq $raw) { $raw = "" }
if ($raw -match [regex]::Escape($hostname)) {
    Write-Host "hosts already mentions '$hostname'. Edit manually if you need a different IP:"
    Write-Host "  $hostsPath"
    exit 0
}

if ($WhatIf) {
    Write-Host "Would append to $hostsPath :"
    Write-Host $line
    if (-not (Test-IsAdministrator)) {
        Write-Host ""
        Write-Warning "Your session is not elevated; the real run will fail until you use Run as administrator."
        Write-Host "Or use -PrintLine to copy the line and paste in Notepad (Run as administrator)."
    }
    exit 0
}

if (-not (Test-IsAdministrator)) {
    Write-Error "Cannot write to hosts without Administrator rights. Path: $hostsPath. Either run PowerShell as Administrator with the same -IpAddress, or use -PrintLine and paste into hosts via Notepad (Run as administrator)."
}

Add-Content -Path $hostsPath -Value "" -Encoding ascii
Add-Content -Path $hostsPath -Value $line -Encoding ascii
Write-Host "Appended: $line"
Write-Host "Run: ipconfig /flushdns"
Write-Host "Verify (ICMP may be blocked - use port 443): Test-NetConnection $hostname -Port 443"
