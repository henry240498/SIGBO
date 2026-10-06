<#
    "Modo cuartel": hace que SIGBO arranque solo al iniciar sesion en esta PC
    (SQL Server en Docker, Ollama, backend y frontend), sin abrir el navegador.

    Uso:
      .\programar-arranque.ps1            # arranca 1 minuto despues de iniciar sesion
      .\programar-arranque.ps1 -Quitar    # deja de arrancar solo

    Corre con TU usuario (no pide contrasena ni administrador) y solo cuando
    hay una sesion de Windows iniciada. Si la PC se enciende sin que nadie
    inicie sesion, SIGBO no arranca: para eso habria que configurar el inicio
    de sesion automatico de Windows (decision del cuartel).
    El resultado queda en logs\arranque-automatico.log.
#>
[CmdletBinding()]
param([switch] $Quitar)

$ErrorActionPreference = 'Stop'
$nombre = 'SIGBO-Arranque-Automatico'

if ($Quitar) {
    if (Get-ScheduledTask -TaskName $nombre -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $nombre -Confirm:$false
        Write-Host "Tarea $nombre eliminada."
    } else {
        Write-Host 'No habia tarea programada.'
    }
    return
}

$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$inicio = Join-Path $raiz 'iniciar-sigbo.ps1'
if (-not (Test-Path -LiteralPath $inicio)) { throw "No se encuentra $inicio" }
$registro = Join-Path $raiz 'logs\arranque-automatico.log'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $registro) | Out-Null

$comando = "`"=== `$(Get-Date -Format s) ===`" | Add-Content -LiteralPath '$registro'; " +
           "& '$inicio' -NoBrowser -NoPause *>&1 | Out-String | Add-Content -LiteralPath '$registro'"
$accion = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command `"$comando`""
$usuario = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$disparador = New-ScheduledTaskTrigger -AtLogOn -User $usuario
$disparador.Delay = 'PT1M'
$ajustes = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
$principal = New-ScheduledTaskPrincipal -UserId $usuario -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $nombre -Action $accion -Trigger $disparador -Settings $ajustes -Principal $principal `
    -Description 'Arranca SIGBO al iniciar sesion. Ver logs\arranque-automatico.log' -Force | Out-Null

Write-Host "Tarea $nombre programada: SIGBO arrancara 1 minuto despues de iniciar sesion." -ForegroundColor Green
Write-Host 'Para quitarla: .\programar-arranque.ps1 -Quitar'
