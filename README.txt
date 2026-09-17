NAJAF REAL CONNECTION FIX

1. Stop npm start with Ctrl+C.
2. Download this ZIP to Downloads.
3. In PowerShell:
cd "D:\Syed-Food-Center-main\Najaf-delivery-site-main"
Expand-Archive "$env:USERPROFILE\Downloads\NAJAF-REAL-CONNECTION-MANUAL-FIX.zip" -DestinationPath "D:\Syed-Food-Center-main\Najaf-delivery-site-main" -Force
npm install @supabase/supabase-js@2 mapbox-gl@3
Test-Path ".\src\lib\supabase.js"
Test-Path ".\src\lib\api.js"
Test-Path ".\src\components\RealDeliveryMap.js"
npm start
