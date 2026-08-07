<#
    SIGBO-CBVC - Inicia el Backend (NestJS) y el Frontend (Next.js),
    verifica que ambos queden operativos y abre el navegador.
#>
param(
    [switch]$NoPause,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$logsDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

# Asegura que node/npm esten en el PATH de este proceso
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

function Test-Puerto {
    param([int]$Puerto, [int]$TimeoutMs = 800)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $task = $client.ConnectAsync("localhost", $Puerto)
        $ok = $task.Wait($TimeoutMs)
        $client.Close()
        return $ok
    } catch { return $false }
}

function Esperar-Puerto {
    param([int]$Puerto, [string]$Nombre, [int]$MaxSegundos = 45)
    Write-Host "Esperando que $Nombre responda en el puerto $Puerto..." -ForegroundColor DarkGray
    $intentos = 0
    while (-not (Test-Puerto -Puerto $Puerto)) {
        Start-Sleep -Seconds 1
        $intentos++
        if ($intentos -ge $MaxSegundos) {
            Write-Host "ERROR: $Nombre no respondio en $Puerto tras $MaxSegundos segundos." -ForegroundColor Red
            Write-Host "Revisa los logs en: $logsDir" -ForegroundColor Red
            return $false
        }
    }
    Write-Host "$Nombre OPERATIVO en el puerto $Puerto (esperado $intentos s)" -ForegroundColor Green
    return $true
}

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   SIGBO-CBVC - Inicio del sistema" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# --- BACKEND ---
if (Test-Puerto -Puerto 3001) {
    Write-Host "Backend ya esta operativo en el puerto 3001 (no se reinicia)." -ForegroundColor Yellow
} else {
    Write-Host "Iniciando Backend (NestJS)..." -ForegroundColor Cyan
    if (-not (Test-Path (Join-Path $backendDir "dist\main.js"))) {
        Write-Host "No existe backend\dist\main.js. Compilando con 'npm run build'..." -ForegroundColor Yellow
        Push-Location $backendDir
        cmd /c "npm run build > `"$logsDir\backend-build.log`" 2>&1"
        Pop-Location
    }
    Start-Process -FilePath "node" -ArgumentList "dist/main.js" `
        -WorkingDirectory $backendDir `
        -RedirectStandardOutput (Join-Path $logsDir "backend-out.log") `
        -RedirectStandardError (Join-Path $logsDir "backend-err.log") `
        -WindowStyle Hidden
}

$backendOk = Esperar-Puerto -Puerto 3001 -Nombre "Backend"

# --- FRONTEND ---
if (Test-Puerto -Puerto 3000) {
    Write-Host "Frontend ya esta operativo en el puerto 3000 (no se reinicia)." -ForegroundColor Yellow
} else {
    Write-Host "Iniciando Frontend (Next.js)..." -ForegroundColor Cyan
    if (-not (Test-Path (Join-Path $frontendDir ".next"))) {
        Write-Host "No existe frontend\.next. Compilando con 'npm run build'..." -ForegroundColor Yellow
        Push-Location $frontendDir
        cmd /c "npm run build > `"$logsDir\frontend-build.log`" 2>&1"
        Pop-Location
    }
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" `
        -WorkingDirectory $frontendDir `
        -RedirectStandardOutput (Join-Path $logsDir "frontend-out.log") `
        -RedirectStandardError (Join-Path $logsDir "frontend-err.log") `
        -WindowStyle Hidden
}

$frontendOk = Esperar-Puerto -Puerto 3000 -Nombre "Frontend"

Write-Host ""
if ($backendOk -and $frontendOk) {
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "   SIGBO-CBVC iniciado correctamente" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "  Backend  : http://localhost:3001/api/v1"
    Write-Host "  Swagger  : http://localhost:3001/api/docs"
    Write-Host "  Frontend : http://localhost:3000"
    Write-Host ""
    if (-not $NoBrowser) {
        Start-Process "http://localhost:3000/login"
    }
} else {
    Write-Host "El sistema NO quedo completamente operativo. Revisa la carpeta 'logs'." -ForegroundColor Red
}

if (-not $NoPause) {
    Write-Host ""
    Write-Host "Presione una tecla para cerrar esta ventana (los servicios seguiran ejecutandose en segundo plano)..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
