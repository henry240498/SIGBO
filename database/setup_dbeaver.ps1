<#
============================================================================
 setup_dbeaver.ps1
 SIGBO-CBVC - Crear una conexion local de DBeaver sin administrar secretos
============================================================================

 Escribe una conexion local en data-sources.json y crea una copia de
 seguridad antes de modificarlo. No lee, recibe, muestra ni guarda
 contrasenas: DBeaver debe solicitarlas y, si corresponde, gestionarlas con
 su propio almacen de credenciales.

 Cerrar DBeaver antes de ejecutarlo. DBeaver mantiene la configuracion en
 memoria y podria sobrescribir este cambio al cerrarse.

 USO
   .\setup_dbeaver.ps1
   .\setup_dbeaver.ps1 -WorkspacePath "C:\ruta\DBeaverData\workspace6"
============================================================================
#>

[CmdletBinding()]
param(
    [string] $Name = 'SIGBO local (sigbo_cbvc)',
    [string] $DbHost = 'localhost',
    [int] $Port = 1433,
    [string] $Database = 'sigbo_cbvc',
    [string] $User = 'sigbo_app',
    [string] $WorkspacePath
)

$ErrorActionPreference = 'Stop'

function Ok([string] $mensaje) {
    Write-Host "   [OK]   $mensaje" -ForegroundColor Green
}

function Fail([string] $mensaje) {
    Write-Host "   [ERR]  $mensaje" -ForegroundColor Red
}

if (@('localhost', '127.0.0.1', '::1', $env:COMPUTERNAME) -notcontains $DbHost) {
    Fail "ABORTADO: '$DbHost' no es local. Este script solo configura conexiones locales."
    exit 1
}

if ($Database -ne 'sigbo_cbvc') {
    Fail "ABORTADO: la base de SIGBO debe ser 'sigbo_cbvc'; se recibio '$Database'."
    exit 1
}

if (Get-Process -Name 'dbeaver' -ErrorAction SilentlyContinue) {
    Fail 'DBeaver esta abierto. Cerralo antes de modificar su configuracion.'
    exit 1
}

Write-Host ''
Write-Host '>> 1. Localizar el workspace de DBeaver' -ForegroundColor Cyan

if (-not $WorkspacePath) {
    $roots = @(
        (Join-Path $env:APPDATA 'DBeaverData'),
        (Join-Path $env:USERPROFILE '.local\share\DBeaverData')
    ) | Where-Object { Test-Path $_ }

    if (-not $roots) {
        Fail 'No se encontro DBeaverData. Abra DBeaver una vez o indique -WorkspacePath.'
        exit 1
    }

    $workspace = Get-ChildItem -Path $roots -Directory -Filter 'workspace*' -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        Select-Object -First 1
    if (-not $workspace) {
        Fail "No se encontro un workspace dentro de: $($roots -join ', ')"
        exit 1
    }
    $WorkspacePath = $workspace.FullName
}

if (-not (Test-Path $WorkspacePath -PathType Container)) {
    Fail "El workspace no existe: $WorkspacePath"
    exit 1
}
Ok "Workspace: $WorkspacePath"

$projectDir = Join-Path $WorkspacePath 'General'
if (-not (Test-Path (Join-Path $projectDir '.dbeaver'))) {
    $candidate = Get-ChildItem $WorkspacePath -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName '.dbeaver') } |
        Select-Object -First 1
    if ($candidate) {
        $projectDir = $candidate.FullName
    }
}

$configurationDir = Join-Path $projectDir '.dbeaver'
if (-not (Test-Path $configurationDir)) {
    New-Item -ItemType Directory -Path $configurationDir -Force | Out-Null
}
Ok "Proyecto: $projectDir"

$dataSourcesFile = Join-Path $configurationDir 'data-sources.json'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

Write-Host ''
Write-Host '>> 2. Preparar data-sources.json' -ForegroundColor Cyan
if (Test-Path $dataSourcesFile) {
    Copy-Item $dataSourcesFile "$dataSourcesFile.bak-$timestamp" -Force
    Ok "Backup: $(Split-Path $dataSourcesFile -Leaf).bak-$timestamp"
    try {
        $dataSources = Get-Content $dataSourcesFile -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        Fail "data-sources.json no es JSON valido: $($_.Exception.Message)"
        exit 1
    }
} else {
    $dataSources = [PSCustomObject]@{
        folders = [PSCustomObject]@{}
        connections = [PSCustomObject]@{}
    }
    Ok 'data-sources.json no existia: se creara.'
}

if (-not $dataSources.PSObject.Properties['connections']) {
    $dataSources | Add-Member -NotePropertyName connections -NotePropertyValue ([PSCustomObject]@{})
}

$connectionId = "sqlserver-sigbo-local-$($Database.ToLowerInvariant())"
$jdbcUrl = "jdbc:sqlserver://$($DbHost):$Port;databaseName=$Database;encrypt=false;trustServerCertificate=true"
$connection = [PSCustomObject]@{
    provider = 'sqlserver'
    driver = 'mssql_jdbc_ms_new'
    name = $Name
    'save-password' = $false
    'read-only' = $false
    configuration = [PSCustomObject]@{
        host = $DbHost
        port = "$Port"
        database = $Database
        user = $User
        url = $jdbcUrl
        configurationType = 'MANUAL'
        type = 'dev'
        closeIdleConnection = $true
        'auth-model' = 'native'
        'provider-properties' = [PSCustomObject]@{
            '@dbeaver-show-non-default-db@' = 'true'
        }
    }
}

if ($dataSources.connections.PSObject.Properties[$connectionId]) {
    $dataSources.connections.PSObject.Properties.Remove($connectionId)
    Ok 'La conexion existente se actualizara.'
}
$dataSources.connections | Add-Member -NotePropertyName $connectionId -NotePropertyValue $connection -Force

$dataSources | ConvertTo-Json -Depth 12 | Set-Content -Path $dataSourcesFile -Encoding UTF8
Ok "Conexion '$Name' escrita en data-sources.json."

Write-Host ''
Write-Host '===================================================='
Write-Host ' CONEXION DBEAVER'
Write-Host '===================================================='
Write-Host "Nombre    : $Name"
Write-Host 'Driver    : Microsoft SQL Server (mssql_jdbc_ms_new)'
Write-Host "Host      : $DbHost"
Write-Host "Puerto    : $Port"
Write-Host "Database  : $Database"
Write-Host "Usuario   : $User"
Write-Host 'Password  : no se administra por este script'
Write-Host "URL JDBC  : $jdbcUrl"
Write-Host "Archivo   : $dataSourcesFile"
Write-Host '===================================================='
Write-Host ''
Write-Host 'Abra DBeaver y proporcione la credencial cuando la solicite.'
Write-Host 'Use una cuenta local de privilegio minimo; no use db_owner.'
