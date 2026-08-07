<#
Usage:
    Ejecutar en PowerShell en la máquina que tiene acceso al servidor SQL (local o red).

    # Autenticación SQL
    .\backup_sqlserver.ps1 -ServerInstance "myserver\\SQLEXPRESS" -Database "miBD" -Username "sa" -Password "P@ssw0rd"

    # Autenticación integrada (Windows Auth)
    .\backup_sqlserver.ps1 -ServerInstance "myserver\\MSSQLSERVER" -Database "miBD" -UseWindowsAuth

    Nota: Si no pasas `-OutputFolder`, el script usará por defecto:
        C:\Users\PC-HORIZONTE\Documents\GitHub\SIGBO\Copia de Seguridad BD

Descripción:
    - Intenta usar Invoke-Sqlcmd si el módulo SqlServer está disponible.
    - Si no está, intenta usar `sqlcmd` en PATH.
    - Crea un archivo .bak y lo comprime en .zip para facilitar transferencia.
#>

param(
        [Parameter(Mandatory = $true)] [string]$ServerInstance,
        [Parameter(Mandatory = $true)] [string]$Database,
        [Parameter(Mandatory = $false)] [string]$Username,
        [Parameter(Mandatory = $false)] [string]$Password,
        [Parameter(Mandatory = $false)] [string]$OutputFolder = 'C:\Users\PC-HORIZONTE\Documents\GitHub\SIGBO\Copia de Seguridad BD',
        [switch]$UseWindowsAuth
)

try {
    if (-not (Test-Path -Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
    }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $bakFile = Join-Path $OutputFolder "$($Database)_$timestamp.bak"
    $zipFile = Join-Path $OutputFolder "$($Database)_$timestamp.zip"

    $backupSql = "BACKUP DATABASE [$Database] TO DISK = N'$bakFile' WITH COPY_ONLY, INIT;"

    Write-Host "Creando backup en: $bakFile"

    # Intentar Invoke-Sqlcmd (módulo SqlServer)
    $invoked = $false
    if (Get-Module -ListAvailable -Name SqlServer) {
        try {
            if ($UseWindowsAuth) {
                Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $backupSql -ErrorAction Stop
            } else {
                Invoke-Sqlcmd -ServerInstance $ServerInstance -Username $Username -Password $Password -Query $backupSql -ErrorAction Stop
            }
            $invoked = $true
        } catch {
            Write-Warning "Invoke-Sqlcmd falló: $($_.Exception.Message)"
            $invoked = $false
        }
    }

    # Si Invoke-Sqlcmd no funcionó, intentar sqlcmd
    if (-not $invoked) {
        $sqlcmdPath = "sqlcmd"
        $args = @("-S", $ServerInstance, "-Q", $backupSql)
        if (-not $UseWindowsAuth) {
            if (-not $Username -or -not $Password) { throw "Se requiere -Username y -Password cuando no se usa -UseWindowsAuth" }
            $args = @("-S", $ServerInstance, "-U", $Username, "-P", $Password, "-Q", $backupSql)
        } else {
            $args = @("-S", $ServerInstance, "-E", "-Q", $backupSql)
        }

        $proc = Start-Process -FilePath $sqlcmdPath -ArgumentList $args -NoNewWindow -Wait -PassThru -ErrorAction Stop
        if ($proc.ExitCode -ne 0) { throw "sqlcmd finalizó con código $($proc.ExitCode)" }
    }

    Write-Host "Backup creado correctamente. Comprimiendo a $zipFile"
    if (Test-Path -Path $zipFile) { Remove-Item -Path $zipFile -Force }
    Compress-Archive -Path $bakFile -DestinationPath $zipFile -Force

    Write-Host "Archivo resultante: $zipFile"
    Write-Host "(Puedes copiar/transferir este .zip a donde necesites)")
} catch {
    Write-Error "Error: $($_.Exception.Message)"
    exit 1
}
