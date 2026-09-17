$ErrorActionPreference = 'Stop'
$project = 'D:\Syed-Food-Center-main\Najaf-delivery-site-main'
$zip = Join-Path $env:USERPROFILE 'Downloads\NAJAF-CONNECTION-FIX-FINAL.zip'
$tmp = Join-Path $env:TEMP 'najaf-connection-fix-final'

Write-Host 'NAJAF CONNECTION FIX' -ForegroundColor Cyan
Write-Host "Project: $project"

if (-not (Test-Path $project)) {
  throw "Project folder not found: $project"
}
Set-Location $project

New-Item -ItemType Directory -Force -Path '.\src\lib' | Out-Null
New-Item -ItemType Directory -Force -Path '.\src\components' | Out-Null

if (-not (Test-Path $zip)) {
  throw "ZIP not found in Downloads: $zip. Download NAJAF-CONNECTION-FIX-FINAL.zip first."
}

Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
Expand-Archive $zip -DestinationPath $tmp -Force

$root = Join-Path $tmp 'NAJAF-CONNECTION-FIX-FINAL'
Copy-Item (Join-Path $root 'src\lib\supabase.js') '.\src\lib\supabase.js' -Force
Copy-Item (Join-Path $root 'src\lib\api.js') '.\src\lib\api.js' -Force
Copy-Item (Join-Path $root 'src\components\RealDeliveryMap.js') '.\src\components\RealDeliveryMap.js' -Force

Write-Host 'Installing required packages...' -ForegroundColor Yellow
npm install @supabase/supabase-js@2 mapbox-gl@3

Write-Host ''
Write-Host 'VERIFYING FILES' -ForegroundColor Green
@(
  '.\src\lib\supabase.js',
  '.\src\lib\api.js',
  '.\src\components\RealDeliveryMap.js'
) | ForEach-Object {
  if (Test-Path $_) { Write-Host "OK  $_" -ForegroundColor Green }
  else { throw "Missing $_" }
}

Write-Host ''
Write-Host 'Installed versions:' -ForegroundColor Green
npm ls @supabase/supabase-js mapbox-gl react react-dom --depth=0

Write-Host ''
Write-Host 'Connection fix complete. Start with: npm start' -ForegroundColor Cyan
