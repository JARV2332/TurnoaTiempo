# Genera app-debug.apk — requiere Node, Android Studio/SDK y npm sin bloqueo de red.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "npm install falló. Si ves error de certificado, prueba otra red o VPN." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "android")) {
  Write-Host "Creando proyecto Android..." -ForegroundColor Cyan
  npx cap add android
}

Write-Host "Sincronizando Capacitor..." -ForegroundColor Cyan
npx cap sync android

Write-Host "Compilando APK debug..." -ForegroundColor Cyan
Set-Location android
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) { exit 1 }

$apk = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
  $dest = Join-Path $PSScriptRoot "TurnoATiempo-Control-debug.apk"
  Copy-Item $apk $dest -Force
  Write-Host ""
  Write-Host "APK listo:" -ForegroundColor Green
  Write-Host $dest
} else {
  Write-Host "No se encontró el APK en $apk" -ForegroundColor Red
  exit 1
}
