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

function Pausar {
    Write-Host ""
    Write-Host "Presione una tecla para cerrar esta ventana..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

try {
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "   SIGBO-CBVC - Inicio del sistema" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""

    # --- BACKEND ---
    # Compila siempre: evita dejar ejecutandose un dist antiguo despues de cambiar
    # el codigo fuente. Si el puerto pertenece a este proyecto, reinicia ese proceso.
    Write-Host "Compilando Backend (NestJS)..." -ForegroundColor Cyan
    Push-Location $backendDir
    cmd /c "npm run build > `"$logsDir\backend-build.log`" 2>&1"
    $backendBuildExit = $LASTEXITCODE
    Pop-Location
    if ($backendBuildExit -ne 0) {
        throw "La compilacion del Backend fallo (codigo $backendBuildExit). Revisa logs\backend-build.log"
    }

    $backendPid = (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty OwningProcess)
    if ($backendPid) {
        $backendProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$backendPid"
        # Cualquier proceso node ejecutando dist/main (con o sin extension
        # ".js" -- "npm start" invoca "node dist/main" sin extension, mientras
        # que este script arranca "node dist/main.js") desde ESTE repo se
        # considera una instancia previa de SIGBO y se reinicia sin preguntar.
        if ($backendProcess.CommandLine -like "*$backendDir*" -or
            $backendProcess.CommandLine -match '(?i)\bdist[\\/]main(\.js)?\b') {
            Write-Host "Reiniciando Backend actualizado..." -ForegroundColor Yellow
            Stop-Process -Id $backendPid -Force
            Start-Sleep -Milliseconds 500
        } else {
            throw "El puerto 3001 esta ocupado por otro proceso ajeno a SIGBO: $($backendProcess.CommandLine)"
        }
    }
    Start-Process -FilePath "node" -ArgumentList "dist/main.js" `
        -WorkingDirectory $backendDir `
        -RedirectStandardOutput (Join-Path $logsDir "backend-out.log") `
        -RedirectStandardError (Join-Path $logsDir "backend-err.log") `
        -WindowStyle Hidden

    $backendOk = Esperar-Puerto -Puerto 3001 -Nombre "Backend"

    # --- FRONTEND ---
    Write-Host "Compilando Frontend (Next.js)..." -ForegroundColor Cyan
    Push-Location $frontendDir
    cmd /c "npm run build > `"$logsDir\frontend-build.log`" 2>&1"
    $frontendBuildExit = $LASTEXITCODE
    Pop-Location
    if ($frontendBuildExit -ne 0) {
        throw "La compilacion del Frontend fallo (codigo $frontendBuildExit). Revisa logs\frontend-build.log"
    }

    $frontendPid = (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty OwningProcess)
    if ($frontendPid) {
        $frontendProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$frontendPid"
        # Next puede expandir su binario a node_modules en vez de conservar el
        # working directory en CommandLine; ambos patrones identifican el proceso
        # que este iniciador crea para el puerto 3000.
        if ($frontendProcess.CommandLine -like "*$frontendDir*" -or
            $frontendProcess.CommandLine -match '(?i)next(?:\.js)?\s+start') {
            Write-Host "Reiniciando Frontend actualizado..." -ForegroundColor Yellow
            Stop-Process -Id $frontendPid -Force
            Start-Sleep -Milliseconds 500
        } else {
            throw "El puerto 3000 esta ocupado por otro proceso ajeno a SIGBO: $($frontendProcess.CommandLine)"
        }
    }
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" `
        -WorkingDirectory $frontendDir `
        -RedirectStandardOutput (Join-Path $logsDir "frontend-out.log") `
        -RedirectStandardError (Join-Path $logsDir "frontend-err.log") `
        -WindowStyle Hidden

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

    if (-not $NoPause) { Pausar }
} catch {
    # Nunca dejar que la ventana se cierre sola sin mostrar el motivo: es la
    # causa mas comun de "compila y se cierra sin abrir nada".
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Red
    Write-Host "   ERROR AL INICIAR SIGBO-CBVC" -ForegroundColor Red
    Write-Host "=======================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa la carpeta 'logs' para mas detalle." -ForegroundColor Yellow
    Pausar
    exit 1
}
