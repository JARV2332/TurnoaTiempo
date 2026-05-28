# Cierra Cursor antes de ejecutar este script.
# Clic derecho -> "Ejecutar con PowerShell" o en PowerShell:
#   cd $env:USERPROFILE\Downloads
#   .\b_ZvkO35s1Wam-1773355183633\rename-workspace.ps1

$origen = Join-Path $env:USERPROFILE 'Downloads\b_ZvkO35s1Wam-1773355183633'
$destino = Join-Path $env:USERPROFILE 'Downloads\Turno a Tiempo'

if (-not (Test-Path -LiteralPath $origen)) {
  if (Test-Path -LiteralPath $destino) {
    Write-Host 'La carpeta ya se llama "Turno a Tiempo". Abre esa ruta en Cursor.' -ForegroundColor Green
    exit 0
  }
  Write-Host "No se encontró la carpeta origen: $origen" -ForegroundColor Red
  exit 1
}

if (Test-Path -LiteralPath $destino) {
  Write-Host 'Ya existe "Turno a Tiempo" en Descargas. Elimina o renombra esa carpeta primero.' -ForegroundColor Red
  exit 1
}

Rename-Item -LiteralPath $origen -NewName 'Turno a Tiempo'
Write-Host 'Listo. Carpeta renombrada a:' -ForegroundColor Green
Write-Host $destino
Write-Host ''
Write-Host 'En Cursor: File -> Open Folder -> selecciona "Turno a Tiempo" en Descargas.'
