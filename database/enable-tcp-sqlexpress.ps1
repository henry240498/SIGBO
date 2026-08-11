<#
    SIGBO-CBVC - Habilita TCP/IP en la instancia SQL Server Express.

    Por que hace falta: el backend usa el driver mssql/tedious, que solo habla
    TCP. La instancia viene con TCP/IP deshabilitado y puerto dinamico, asi que
    TypeORM no conecta a localhost:1433 aunque la base exista y el login sirva.
    Las migraciones si funcionan porque sqlcmd -E usa memoria compartida.

    REQUIERE ejecutarse en PowerShell **como Administrador**: escribe en HKLM y
    reinicia el servicio de SQL Server.

    Uso:  .\enable-tcp-sqlexpress.ps1 [-Instancia MSSQL15.SQLEXPRESS] [-Puerto 1433]
#>
param(
    [string]$Instancia = "MSSQL15.SQLEXPRESS",
    [int]$Puerto = 1433
)

$ErrorActionPreference = "Stop"

# --- Verifica elevacion antes de tocar nada ---
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: hay que ejecutar este script como Administrador." -ForegroundColor Red
    Write-Host "       Abri PowerShell con 'Ejecutar como administrador' y volve a correrlo." -ForegroundColor Red
    exit 1
}

$tcpKey = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$Instancia\MSSQLServer\SuperSocketNetLib\Tcp"
if (-not (Test-Path $tcpKey)) {
    Write-Host "ERROR: no existe la clave de registro para la instancia '$Instancia'." -ForegroundColor Red
    Write-Host "       Instancias disponibles:" -ForegroundColor Yellow
    Get-ChildItem "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server" |
        Where-Object { $_.PSChildName -like "MSSQL*" } |
        ForEach-Object { Write-Host "         $($_.PSChildName)" }
    exit 1
}

$servicio = "MSSQL`$" + ($Instancia -replace '^MSSQL\d+\.', '')

Write-Host "Instancia : $Instancia"
Write-Host "Servicio  : $servicio"
Write-Host "Puerto    : $Puerto"
Write-Host ""

# --- Estado previo (por si hay que revertir) ---
$antes = Get-ItemProperty $tcpKey
$antesIpAll = Get-ItemProperty "$tcpKey\IPAll"
Write-Host "Estado previo -> Enabled=$($antes.Enabled) TcpPort='$($antesIpAll.TcpPort)' TcpDynamicPorts='$($antesIpAll.TcpDynamicPorts)'" -ForegroundColor DarkGray

# --- Habilita TCP y fija el puerto estatico ---
Set-ItemProperty $tcpKey -Name Enabled -Value 1 -Type DWord
Set-ItemProperty "$tcpKey\IPAll" -Name TcpPort -Value "$Puerto" -Type String
Set-ItemProperty "$tcpKey\IPAll" -Name TcpDynamicPorts -Value "" -Type String
Write-Host "TCP/IP habilitado y puerto fijado en $Puerto." -ForegroundColor Green

# --- Reinicia el servicio para que tome la nueva configuracion ---
Write-Host "Reiniciando $servicio (SQL Server solo lee esta config al arrancar)..." -ForegroundColor Cyan
Restart-Service $servicio -Force
Write-Host "Servicio reiniciado." -ForegroundColor Green

# --- Verificacion ---
Write-Host ""
$escuchando = $false
foreach ($i in 1..20) {
    Start-Sleep -Seconds 1
    if (Get-NetTCPConnection -State Listen -LocalPort $Puerto -ErrorAction SilentlyContinue) {
        $escuchando = $true; break
    }
}

if ($escuchando) {
    Write-Host "OK: SQL Server esta escuchando en el puerto $Puerto." -ForegroundColor Green
    Write-Host ""
    Write-Host "Siguiente paso: arrancar el sistema con" -ForegroundColor Cyan
    Write-Host "  cd $(Split-Path $PSScriptRoot -Parent)"
    Write-Host "  .\start-sigbo.ps1"
} else {
    Write-Host "ATENCION: el servicio reinicio pero nada escucha en $Puerto." -ForegroundColor Yellow
    Write-Host "Revisa el log de errores de SQL Server:" -ForegroundColor Yellow
    Write-Host "  C:\Program Files\Microsoft SQL Server\$Instancia\MSSQL\Log\ERRORLOG" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para revertir:" -ForegroundColor DarkGray
    Write-Host "  Set-ItemProperty '$tcpKey' -Name Enabled -Value $($antes.Enabled)" -ForegroundColor DarkGray
    Write-Host "  Restart-Service $servicio -Force" -ForegroundColor DarkGray
    exit 1
}
