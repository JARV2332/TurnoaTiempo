# Genera app-debug.apk — requiere Node, Android Studio/SDK.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Install-NpmDeps {
  if (Test-Path "node_modules\@capacitor\android") { return $true }

  Write-Host "Instalando dependencias (npm)..." -ForegroundColor Cyan
  npm install
  if ($LASTEXITCODE -eq 0) { return $true }

  Write-Host "Reintentando con registro espejo (proxy/antivirus bloquea npmjs.org)..." -ForegroundColor Yellow
  npm install --registry https://registry.npmmirror.com --strict-ssl=false
  if ($LASTEXITCODE -eq 0) { return $true }

  Write-Host ""
  Write-Host "npm sigue fallando. Prueba:" -ForegroundColor Red
  Write-Host "  1) Hotspot del movil y vuelve a ejecutar build-apk.ps1" -ForegroundColor Red
  Write-Host "  2) npm install --registry https://registry.npmmirror.com --strict-ssl=false" -ForegroundColor Red
  return $false
}

function Ensure-AndroidSdk {
  $sdk = "$env:LOCALAPPDATA\Android\Sdk"
  if (-not (Test-Path $sdk)) {
    Write-Host "No se encontro Android SDK. Instala Android Studio y el SDK." -ForegroundColor Red
    exit 1
  }
  $props = Join-Path $PSScriptRoot "android\local.properties"
  if (-not (Test-Path $props)) {
    $escaped = $sdk -replace '\\', '\\'
    "sdk.dir=$escaped" | Set-Content -Path $props -Encoding ASCII
    Write-Host "SDK configurado: $sdk" -ForegroundColor Cyan
  }
}

if (-not (Install-NpmDeps)) { exit 1 }

Ensure-AndroidSdk

if (-not (Test-Path "android")) {
  Write-Host "Creando proyecto Android..." -ForegroundColor Cyan
  npx cap add android
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "Generando icono de la app (logo Turno a Tiempo)..." -ForegroundColor Cyan
npm run icons
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Sincronizando Capacitor..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Compilando APK debug (puede tardar varios minutos la primera vez)..." -ForegroundColor Cyan
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
  Write-Host "No se encontro el APK en $apk" -ForegroundColor Red
  exit 1
}
