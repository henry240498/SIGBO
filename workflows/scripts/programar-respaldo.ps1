<#
    Programa el respaldo diario de SIGBO en el Programador de tareas de Windows.

    Uso:
      .\programar-respaldo.ps1                 # todos los dias a las 02:00
      .\programar-respaldo.ps1 -Hora 03:30
      .\programar-respaldo.ps1 -Quitar         # elimina la tarea

    La tarea corre con TU usuario (no pide contrasena ni privilegios de
    administrador) y solo cuando hay una sesion iniciada. Cada ejecucion hace
    el respaldo, lo verifica y, una vez por semana (domingos), tambien lo
    restaura de prueba. El resultado queda en respaldos\registro.log.
    Si el equipo estaba apagado a la hora, la tarea corre al volver a encender.
    Con -CopiarA E:\Respaldos cada respaldo tambien se copia (y verifica) en ese disco o pendrive.
#>
[CmdletBinding()]
param(
    [string] $Hora = '02:00',
    [string] $CopiarA,
    [switch] $Quitar
)

$ErrorActionPreference = 'Stop'
$nombreTarea = 'SIGBO-Respaldo-Diario'

if ($Quitar) {
    if (Get-ScheduledTask -TaskName $nombreTarea -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $nombreTarea -Confirm:$false
        Write-Host "Tarea $nombreTarea eliminada."
    } else {
        Write-Host 'No habia tarea programada.'
    }
    return
}

if ($Hora -notmatch '^([01]\d|2[0-3]):[0-5]\d$') { throw 'La hora debe tener el formato HH:mm (24 horas).' }

$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$script = Join-Path $PSScriptRoot 'respaldo-docker.ps1'
$registro = Join-Path $raiz 'respaldos\registro.log'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $registro) | Out-Null

# Los domingos se agrega la restauracion de prueba.
$comando = "`$ErrorActionPreference='Continue'; `$extra = @(); if ((Get-Date).DayOfWeek -eq 'Sunday') { `$extra = @('-ProbarRestauracion') }; " +
           "`"=== `$(Get-Date -Format s) ===`" | Add-Content -LiteralPath '$registro'; " +
           "& '$script' @extra $(if ($CopiarA) { "-CopiarA '$CopiarA'" }) *>&1 | Out-String | Add-Content -LiteralPath '$registro'; " +
           "if (`$LASTEXITCODE -ne 0 -or -not `$?) { 'RESULTADO: FALLO' | Add-Content -LiteralPath '$registro' } else { 'RESULTADO: OK' | Add-Content -LiteralPath '$registro' }"

$accion = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command `"$comando`""
$disparador = New-ScheduledTaskTrigger -Daily -At $Hora
$ajustes = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 2)
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $nombreTarea -Action $accion -Trigger $disparador -Settings $ajustes -Principal $principal `
    -Description 'Respaldo verificable de la base de SIGBO (Docker). Ver respaldos\registro.log' -Force | Out-Null

Write-Host "Tarea $nombreTarea programada todos los dias a las $Hora." -ForegroundColor Green
Write-Host "Respaldos en: $(Join-Path $raiz 'respaldos')"
Write-Host 'Para probarla ahora: Start-ScheduledTask -TaskName SIGBO-Respaldo-Diario'
