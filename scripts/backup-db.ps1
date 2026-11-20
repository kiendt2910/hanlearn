# HanLearn PostgreSQL Backup Helper (Windows PowerShell)
# Usage: .\scripts\backup-db.ps1 -DatabaseUrl "postgresql://..." -OutputDir ".\backups"
param(
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [string]$OutputDir = ".\backups"
)

if (-not $DatabaseUrl) {
  Write-Error "DATABASE_URL is required."
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $OutputDir "hanlearn_$timestamp.sql"

pg_dump $DatabaseUrl --no-owner --no-acl -f $outFile
if ($LASTEXITCODE -eq 0) {
  Write-Host "Backup saved to $outFile"
} else {
  Write-Error "pg_dump failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
