<#
============================================================================
 verify_local.ps1
 SIGBO-CBVC - Auditoria de solo lectura del entorno local
============================================================================

 No crea, altera ni borra objetos ni datos. No contiene credenciales ni las
 toma de archivos .env. Usa autenticacion integrada de Windows por defecto.
 Para comprobar una cuenta SQL de aplicacion, pase un SecureString de forma
 interactiva:

   .\verify_local.ps1
   .\verify_local.ps1 -Authentication Sql -User sigbo_app -Password (Read-Host 'Contrasena local' -AsSecureString)
============================================================================
#>

[CmdletBinding()]
param(
    [string] $ServerInstance = 'localhost\SQLEXPRESS',
    [string] $Database = 'sigbo_cbvc',
    [string] $User = 'sigbo_app',
    [ValidateSet('Integrated', 'Sql')]
    [string] $Authentication = 'Integrated',
    [System.Security.SecureString] $Password
)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Data

function Write-Check {
    param(
        [string] $Name,
        [scriptblock] $Test,
        [string] $Detail = ''
    )

    try {
        $result = & $Test
        $script:results[$Name] = if ($result) {
            "OK $Detail"
        } else {
            "REQUIERE INTERVENCION $Detail"
        }
        return $result
    } catch {
        $script:results[$Name] = "REQUIERE INTERVENCION ($($_.Exception.Message))"
        return $false
    }
}

function Get-PlainPassword {
    if ($null -eq $Password) {
        throw 'Indique -Password como SecureString para comprobar autenticacion SQL.'
    }

    $pointer = [IntPtr]::Zero
    try {
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
        if ($pointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        }
    }
}

function Invoke-SigboScalar {
    param(
        [Parameter(Mandatory)]
        [string] $Sql,
        [string] $Catalog = $Database,
        [switch] $SqlAuthentication
    )

    $builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new()
    $builder['Data Source'] = $ServerInstance
    $builder['Initial Catalog'] = $Catalog
    $builder['Encrypt'] = $false
    $builder['TrustServerCertificate'] = $true
    $builder['Connect Timeout'] = 15

    if ($SqlAuthentication) {
        if ($Authentication -ne 'Sql') {
            throw 'Use -Authentication Sql para comprobar una cuenta SQL.'
        }
        $builder['Integrated Security'] = $false
        $builder['User ID'] = $User
        $builder['Password'] = Get-PlainPassword
    } else {
        $builder['Integrated Security'] = $true
    }

    $connection = [System.Data.SqlClient.SqlConnection]::new($builder.ConnectionString)
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = $Sql
        return $command.ExecuteScalar()
    } finally {
        $connection.Dispose()
    }
}

$hostName = ($ServerInstance -split '[\\,]')[0]
if (@('localhost', '127.0.0.1', '.', '(local)', $env:COMPUTERNAME) -notcontains $hostName) {
    Write-Error "ABORTADO: '$hostName' no es local."
    exit 1
}

if ($Database -ne 'sigbo_cbvc') {
    Write-Error "ABORTADO: la base de SIGBO debe ser 'sigbo_cbvc'; se recibio '$Database'."
    exit 1
}

$results = [ordered]@{}
Write-Host ''
Write-Host "Auditando $ServerInstance / $Database ..."
Write-Host ''

Write-Check '1. Conexion local al motor' {
    (Invoke-SigboScalar -Sql 'SELECT 1;' -Catalog 'master') -eq 1
} | Out-Null

Write-Check '2. Base de datos SIGBO' {
    (Invoke-SigboScalar -Sql "SELECT CASE WHEN DB_ID(N'$Database') IS NULL THEN 0 ELSE 1 END;" -Catalog 'master') -eq 1
} | Out-Null

Write-Check '3. Historial de migraciones' {
    (Invoke-SigboScalar -Sql "SELECT COUNT(*) FROM sys.tables WHERE schema_id = SCHEMA_ID(N'dbo') AND name = N'__sigbo_migrations';") -eq 1
} | Out-Null

Write-Check '4. Migraciones aplicadas' {
    (Invoke-SigboScalar -Sql 'SELECT COUNT(*) FROM dbo.__sigbo_migrations;') -gt 0
} | Out-Null

Write-Check '5. Esquemas de SIGBO' {
    (Invoke-SigboScalar -Sql "SELECT COUNT(*) FROM sys.schemas WHERE name IN (N'seguridad', N'organizacion', N'personal', N'academia', N'operaciones', N'vehiculos', N'equipos', N'servicios', N'finanzas', N'deposito', N'documentos');") -gt 0
} | Out-Null

Write-Check '6. Tablas de usuario' {
    (Invoke-SigboScalar -Sql 'SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0;') -gt 0
} | Out-Null

Write-Check '7. Tabla de usuarios' {
    $null -ne (Invoke-SigboScalar -Sql "SELECT OBJECT_ID(N'seguridad.usuarios', N'U');")
} | Out-Null

if ($Authentication -eq 'Sql') {
    Write-Check '8. Conexion de cuenta SQL' {
        (Invoke-SigboScalar -Sql 'SELECT 1;' -SqlAuthentication) -eq 1
    } | Out-Null
} else {
    $results['8. Conexion de cuenta SQL'] = 'omitido (use -Authentication Sql y un SecureString para comprobarla)'
}

try {
    $tables = Invoke-SigboScalar -Sql 'SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0;'
    $foreignKeys = Invoke-SigboScalar -Sql 'SELECT COUNT(*) FROM sys.foreign_keys;'
    $primaryKeys = Invoke-SigboScalar -Sql "SELECT COUNT(*) FROM sys.key_constraints WHERE type = 'PK';"
    $migrationCount = Invoke-SigboScalar -Sql 'SELECT COUNT(*) FROM dbo.__sigbo_migrations;'
    $results['9. Inventario'] = "informativo (tablas: $tables, FK: $foreignKeys, PK: $primaryKeys, migraciones: $migrationCount)"
} catch {
    $results['9. Inventario'] = "REQUIERE INTERVENCION ($($_.Exception.Message))"
}

$dataSources = Get-ChildItem (Join-Path $env:APPDATA 'DBeaverData') -Recurse -Filter 'data-sources.json' -ErrorAction SilentlyContinue |
    Select-Object -First 1
if ($dataSources) {
    $hasConnection = (Get-Content $dataSources.FullName -Raw) -match [regex]::Escape($Database)
    $results['10. Conexion DBeaver'] = if ($hasConnection) {
        "informativo ($($dataSources.FullName))"
    } else {
        'informativo (DBeaver no contiene una conexion SIGBO)'
    }
} else {
    $results['10. Conexion DBeaver'] = 'informativo (no se encontro data-sources.json)'
}

$environmentFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'backend\.env'
if (Test-Path $environmentFile) {
    $isLocalBackend = (Get-Content $environmentFile -Raw) -match 'DB_HOST\s*=\s*(localhost|127\.0\.0\.1)'
    $results['11. Backend apuntando a local'] = if ($isLocalBackend) {
        "informativo ($environmentFile)"
    } else {
        "REQUIERE INTERVENCION ($environmentFile no apunta a localhost)"
    }
} else {
    $results['11. Backend apuntando a local'] = 'informativo (backend/.env no existe)'
}

$line = '=' * 68
Write-Host $line
Write-Host ' SIGBO - AUDITORIA LOCAL'
Write-Host $line
foreach ($name in $results.Keys) {
    $value = $results[$name]
    $color = if ($value -like 'OK*' -or $value -like 'informativo*' -or $value -like 'omitido*') {
        'Green'
    } else {
        'Yellow'
    }
    Write-Host ('{0,-34}{1}' -f ($name + ':'), $value) -ForegroundColor $color
}
Write-Host $line

$pending = @($results.Values | Where-Object { $_ -like 'REQUIERE*' }).Count
if ($pending -eq 0) {
    Write-Host ' Todo OK.' -ForegroundColor Green
    exit 0
}

Write-Host " $pending elemento(s) requieren intervencion (ver arriba)." -ForegroundColor Yellow
exit 1
