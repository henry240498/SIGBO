<#
============================================================================
 backup_sqlserver.ps1
 SIGBO-CBVC - Respaldo SQL Server con autenticacion integrada
============================================================================

 Crea un backup COPY_ONLY con CHECKSUM y lo verifica desde SQL Server.
 No acepta contrasenas ni crea archivos ZIP: un ZIP no aporta cifrado y las
 credenciales pasadas a sqlcmd quedan expuestas en historial y procesos.

 Ejemplo:
   .\backup_sqlserver.ps1 -ServerInstance "SERVIDOR\INSTANCIA" -Database "sigbo_cbvc"
   .\backup_sqlserver.ps1 -ServerInstance ".\SQLEXPRESS" -Database "sigbo_cbvc" -OutputFolder "D:\Respaldos\SIGBO"

 Requisitos:
 - Ejecutar con una cuenta Windows autorizada para BACKUP DATABASE.
 - La carpeta de salida debe ser accesible para la cuenta del servicio SQL
   Server. En servidores remotos, la ruta se interpreta en el servidor SQL.
 - Proteger el .bak con controles de acceso, retencion y cifrado institucional
   aprobados. Este script no inventa ni modifica esas politicas.
============================================================================
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $ServerInstance,
    [Parameter(Mandatory = $true)]
    [string] $Database,
    [string] $OutputFolder
)

$ErrorActionPreference = 'Stop'

function ConvertTo-SqlIdentifier([string] $value) {
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw 'El identificador SQL no puede estar vacio.'
    }
    return '[' + $value.Replace(']', ']]') + ']'
}

function ConvertTo-SqlLiteral([string] $value) {
    return "N'$($value.Replace("'", "''"))'"
}

function Invoke-SigboSql([string] $query) {
    $invokeSqlcmd = Get-Command Invoke-Sqlcmd -ErrorAction SilentlyContinue
    if ($invokeSqlcmd) {
        Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $query -ErrorAction Stop
        return
    }

    & sqlcmd -S $ServerInstance -E -I -b -Q $query
    if ($LASTEXITCODE -ne 0) {
        throw "sqlcmd finalizo con codigo $LASTEXITCODE."
    }
}

if (-not $OutputFolder) {
    $documents = [Environment]::GetFolderPath([Environment+SpecialFolder]::MyDocuments)
    if ([string]::IsNullOrWhiteSpace($documents)) {
        throw 'Indique -OutputFolder: no se pudo determinar la carpeta Documentos.'
    }
    $OutputFolder = Join-Path $documents 'SIGBO-Backups'
}

$outputAbsolute = [IO.Path]::GetFullPath($OutputFolder)
if (-not (Test-Path -LiteralPath $outputAbsolute)) {
    New-Item -ItemType Directory -Path $outputAbsolute -Force | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$safeName = ($Database -replace '[^A-Za-z0-9._-]', '_')
$backupFile = Join-Path $outputAbsolute ($safeName + '_' + $timestamp + '.bak')
$databaseSql = ConvertTo-SqlIdentifier $Database
$backupSql = ConvertTo-SqlLiteral $backupFile

Write-Host "Creando backup COPY_ONLY en: $backupFile" -ForegroundColor Cyan
Invoke-SigboSql "BACKUP DATABASE $databaseSql TO DISK = $backupSql WITH COPY_ONLY, CHECKSUM, INIT, STATS = 10;"

Write-Host 'Verificando el respaldo en SQL Server...' -ForegroundColor Cyan
Invoke-SigboSql "RESTORE VERIFYONLY FROM DISK = $backupSql WITH CHECKSUM;"

Write-Host 'Respaldo verificado correctamente.' -ForegroundColor Green
Write-Host "Ubicacion: $backupFile"
Write-Host 'Aplique la retencion, ACL y cifrado aprobados antes de transferir el archivo.' -ForegroundColor Yellow
