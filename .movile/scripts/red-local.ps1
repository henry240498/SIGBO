<# Tarjeta de red local: detecta la IPv4 LAN y sugiere CORS para la app movil.
Uso: .\.movile\scripts\red-local.ps1
No modifica codigo; solo muestra los valores a usar.
#>
$ErrorActionPreference = 'Stop'
$ip = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
  Select-Object -First 1 -ExpandProperty IPAddress
if (-not $ip) { $ip = 'IP-DE-SU-PC' }
Write-Output ''
Write-Output '=== SIGBO movil - red local ==='
Write-Output "IPv4 de esta PC (Henry): $ip"
Write-Output ''
Write-Output 'Backend (misma ventana o servicio):'
Write-Output '  cd backend; npm run start:dev   (escucha en 0.0.0.0:3001 por defecto de Nest)'
Write-Output ''
Write-Output 'En la app (Ajustes > Servidor) o gradle.properties, usar:'
Write-Output "  http://${ip}:3001/api/v1"
Write-Output ''
Write-Output 'Si tambien usa el frontend web desde el celular, agregue el origen'
Write-Output 'a CORS_ORIGIN del backend (.env) SIN tocar codigo, por ejemplo:'
Write-Output "  CORS_ORIGIN=http://localhost:3000,http://${ip}:3000"
Write-Output ''
Write-Output 'Firewall (PowerShell como Administrador, una sola vez):'
Write-Output '  New-NetFirewallRule -DisplayName "SIGBO backend 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow'
