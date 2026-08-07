<#
    SIGBO-CBVC - Ejecutor de migraciones para SQL Server
    Uso: .\run-migrations.ps1 [-Server ".\SQLEXPRESS"] [-Database "sigbo_cbvc"]
#>
param(
    [string]$Server = ".\SQLEXPRESS",
    [string]$Database = "sigbo_cbvc"
)

$ErrorActionPreference = "Stop"
$migrationsDir = Join-Path $PSScriptRoot "migrations"

Write-Host "=== SIGBO-CBVC: ejecutando migraciones ===" -ForegroundColor Cyan
Write-Host "Servidor: $Server" -ForegroundColor DarkGray

# 1. Crear la base de datos (corre en master, sin -d)
sqlcmd -S $Server -E -b -i (Join-Path $migrationsDir "000_create_database.sql")
if ($LASTEXITCODE -ne 0) { throw "Fallo al crear la base de datos" }

# 2. Ejecutar el resto de migraciones en orden, dentro de la BD
$files = Get-ChildItem -Path $migrationsDir -Filter "*.sql" |
    Where-Object { $_.Name -ne "000_create_database.sql" } |
    Sort-Object Name

foreach ($f in $files) {
    Write-Host "-> $($f.Name)" -ForegroundColor Yellow
    sqlcmd -S $Server -E -d $Database -b -i $f.FullName
    if ($LASTEXITCODE -ne 0) { throw "Fallo en migracion $($f.Name)" }
}

Write-Host "=== Migraciones completadas correctamente ===" -ForegroundColor Green
