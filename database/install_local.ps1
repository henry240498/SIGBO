<#
    SIGBO-CBVC - Instalador local seguro

    Este punto de entrada reemplaza al instalador histórico que ejecutaba
    database/scripts/01..16 y podía cargar datos sintéticos. La única ruta
    soportada es database/run-migrations.ps1, con manifiesto, hashes e historial
    de aplicación.

    Uso:
      .\install_local.ps1
      .\install_local.ps1 -Server ".\SQLEXPRESS"
      .\install_local.ps1 -ValidateOnly

    No modifica la configuración de red de SQL Server, no habilita autenticación
    mixta, no crea logins con privilegios amplios y no genera datos de ejemplo.
    Configure el acceso de SQL Server y backend/.env según database/README.md.
#>
[CmdletBinding()]
param(
    [Alias('ServerInstance')]
    [string]$Server = ".\SQLEXPRESS",
    [string]$Database = "sigbo_cbvc",
    [switch]$ValidateOnly,
    [switch]$TestData,
    [switch]$Recreate
)

$ErrorActionPreference = "Stop"

if ($TestData) {
    throw "-TestData fue retirado: SIGBO no instala personas, cargos ni credenciales sintéticas."
}
if ($Recreate) {
    throw "-Recreate fue retirado de este instalador para evitar borrados accidentales. Elimine una base local sólo mediante un procedimiento explícito y respaldado."
}

$runner = Join-Path $PSScriptRoot "run-migrations.ps1"
if (!(Test-Path -LiteralPath $runner)) {
    throw "No se encuentra el ejecutor vigente: $runner"
}

Write-Host "=== SIGBO-CBVC: instalador local seguro ===" -ForegroundColor Cyan
Write-Host "Se usará el manifiesto versionado; no se cargarán datos de ejemplo." -ForegroundColor DarkGray

if ($ValidateOnly) {
    & $runner -Server $Server -Database $Database -ValidateOnly
} else {
    & $runner -Server $Server -Database $Database
}
if (!$?) {
    exit 1
}
if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

if (!$ValidateOnly) {
    Write-Host ""
    Write-Host "Migraciones finalizadas. Configure backend/.env a partir de backend/.env.example." -ForegroundColor Green
    Write-Host "No use cuentas ni contraseñas de demostración fuera de un entorno local controlado." -ForegroundColor Yellow
}
