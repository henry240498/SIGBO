# Tunel temporal para probar la app fuera de la red local (sin servidor publico).
# Expone http://localhost:3001 con una URL https temporal de Cloudflare.
# Uso: .\.movile\scripts\tunel.ps1
# La URL https que muestra se pega en la app en Ajustes > Servidor + /api/v1.
$ErrorActionPreference = 'Stop'
$binDir = Join-Path $env:TEMP 'sigbo-tunel'
New-Item -ItemType Directory -Force -Path $binDir | Out-Null
$exe = Join-Path $binDir 'cloudflared.exe'
if (-not (Test-Path -LiteralPath $exe)) {
  Write-Output 'Descargando cloudflared (una sola vez)...'
  Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile $exe
}
Write-Output ''
Write-Output '=== SIGBO movil - tunel temporal ==='
Write-Output 'Pegue en la app (Ajustes > Servidor) la URL https que aparece abajo + /api/v1'
Write-Output 'Ejemplo: https://xxxx-xxxx.trycloudflare.com/api/v1'
Write-Output ''
& $exe tunnel --url http://localhost:3001
