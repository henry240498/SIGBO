<#
    SIGBO-CBVC - Arranque completo: SQL Server (Docker), Ollama (Snoopy),
    Backend (NestJS) y Frontend (Next.js). Verifica cada pieza y abre el navegador.
    Uso:  iniciar-sigbo.bat [-Rebuild] [-NoBrowser] [-NoPause]
          detener-sigbo.bat  (apaga backend y frontend)
#>
param(
    [switch]$Rebuild,
    [switch]$NoBrowser,
    [switch]$NoPause
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'
$logsDir = Join-Path $root 'logs'
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
            [System.Environment]::GetEnvironmentVariable('Path', 'User')

function Leer-Env([string]$Nombre, $Defecto) {
    $envFile = Join-Path $backendDir '.env'
    if (Test-Path -LiteralPath $envFile) {
        foreach ($l in Get-Content -LiteralPath $envFile) {
            if ($l -match "^\s*$([regex]::Escape($Nombre))\s*=\s*([^#]*?)\s*(?:#.*)?$") { return $Matches[1] }
        }
    }
    return $Defecto
}

$backendPort = [int](Leer-Env 'PORT' 3001)
$dbPort = [int](Leer-Env 'DB_PORT' 14330)
$cors = Leer-Env 'CORS_ORIGIN' 'http://localhost:3002'
$frontendPort = 3002
if (($cors -split ',')[0] -match ':(\d+)\s*$') { $frontendPort = [int]$Matches[1] }

function Test-Puerto([int]$Puerto, [int]$TimeoutMs = 800) {
    try {
        $c = New-Object System.Net.Sockets.TcpClient
        $t = $c.ConnectAsync('127.0.0.1', $Puerto)
        $ok = $t.Wait($TimeoutMs) -and $t.Status -eq [System.Threading.Tasks.TaskStatus]::RanToCompletion
        $c.Close(); return $ok
    } catch { return $false }
}

function Esperar-Puerto([int]$Puerto, [string]$Nombre, [int]$Max = 60) {
    for ($i = 0; $i -lt $Max; $i++) {
        if (Test-Puerto $Puerto) { Write-Host "  [OK] $Nombre en el puerto $Puerto" -ForegroundColor Green; return }
        Start-Sleep -Seconds 1
    }
    throw "$Nombre no respondio en el puerto $Puerto tras $Max s. Revisa la carpeta logs."
}

function Liberar-Puerto([int]$Puerto, [string]$Nombre, [string]$Patron) {
    $dueno = Get-NetTCPConnection -LocalPort $Puerto -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $dueno) { return }
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$($dueno.OwningProcess)"
    if ($p.CommandLine -like "*$root*" -or $p.CommandLine -match $Patron) {
        Write-Host "  Reiniciando $Nombre previo..." -ForegroundColor Yellow
        & taskkill /PID $dueno.OwningProcess /T /F | Out-Null
        Start-Sleep -Seconds 1
    } else {
        throw "El puerto $Puerto esta ocupado por otro programa ajeno a SIGBO: $($p.CommandLine)"
    }
}

# Con Docker apagado, 'docker info' escribe un error: con $ErrorActionPreference='Stop' eso cortaba
# el inicio en vez de dejar que lo arranquemos. Aqui el error solo significa "todavia no esta listo".
function Docker-Listo {
    $previo = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & docker info 2>&1 | Out-Null; return ($LASTEXITCODE -eq 0) } catch { return $false } finally { $ErrorActionPreference = $previo }
}

function Pausar {
    if ($NoPause) { return }
    Write-Host ''
    Write-Host 'Presione una tecla para cerrar esta ventana...'
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

try {
    Write-Host '=======================================' -ForegroundColor Cyan
    Write-Host '   SIGBO-CBVC - Inicio completo'          -ForegroundColor Cyan
    Write-Host '=======================================' -ForegroundColor Cyan

    # 1) SQL Server en Docker -------------------------------------------------
    Write-Host '[1/4] Base de datos (SQL Server en Docker)' -ForegroundColor Cyan
    if (-not (Test-Puerto $dbPort)) {
        if (-not (Docker-Listo)) {
            # Docker Desktop puede estar instalado para todo el equipo o solo para este usuario.
            $dd = @(
                (Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'),
                (Join-Path $env:LOCALAPPDATA 'Programs\DockerDesktop\Docker Desktop.exe')
            ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
            if (-not $dd) { throw 'Docker no esta instalado ni en ejecucion.' }
            Write-Host '  Iniciando Docker Desktop (puede tardar un par de minutos)...' -ForegroundColor Yellow
            Start-Process $dd -WindowStyle Hidden
            $listo = $false
            for ($i = 0; $i -lt 120; $i++) {
                Start-Sleep -Seconds 2
                if (Docker-Listo) { $listo = $true; break }
            }
            if (-not $listo) { throw 'Docker Desktop no quedo listo a tiempo.' }
        }
        & docker start sigbo-sqlserver | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar el contenedor sigbo-sqlserver.' }
    }
    Esperar-Puerto $dbPort 'SQL Server' 90

    # 2) Ollama (motor de Snoopy) ---------------------------------------------
    Write-Host '[2/4] Ollama (asistente Snoopy)' -ForegroundColor Cyan
    if (-not (Test-Puerto 11434)) {
        $ollama = (Get-Command ollama -ErrorAction SilentlyContinue).Source
        if ($ollama) {
            Start-Process $ollama -ArgumentList 'serve' -WindowStyle Hidden
            try { Esperar-Puerto 11434 'Ollama' 30 } catch {
                Write-Host '  [AVISO] Ollama no inicio. Snoopy responde igual con su motor local.' -ForegroundColor Yellow
            }
        } else {
            Write-Host '  [AVISO] Ollama no esta instalado. Snoopy responde con su motor local.' -ForegroundColor Yellow
        }
    } else { Write-Host '  [OK] Ollama ya estaba activo' -ForegroundColor Green }

    # 3) Backend --------------------------------------------------------------
    Write-Host '[3/4] Backend (NestJS)' -ForegroundColor Cyan
    Liberar-Puerto $backendPort 'Backend' '(?i)\bdist[\\/]main(\.js)?\b'
    if ($Rebuild -or -not (Test-Path (Join-Path $backendDir 'dist\main.js'))) {
        Write-Host '  Compilando...' -ForegroundColor DarkGray
        Push-Location $backendDir
        cmd /c "npm run build > `"$logsDir\backend-build.log`" 2>&1"
        $c = $LASTEXITCODE; Pop-Location
        if ($c -ne 0) { throw 'Fallo la compilacion del backend. Ver logs\backend-build.log' }
    }
    Start-Process node.exe -ArgumentList 'dist/main.js' -WorkingDirectory $backendDir `
        -RedirectStandardOutput (Join-Path $logsDir 'backend-out.log') `
        -RedirectStandardError (Join-Path $logsDir 'backend-err.log') -WindowStyle Hidden | Out-Null
    Esperar-Puerto $backendPort 'Backend' 90

    # 4) Frontend -------------------------------------------------------------
    Write-Host '[4/4] Frontend (Next.js)' -ForegroundColor Cyan
    Liberar-Puerto $frontendPort 'Frontend' '(?i)next(?:\.js)?[\\/ ].*start'
    if ($Rebuild -or -not (Test-Path (Join-Path $frontendDir '.next\BUILD_ID'))) {
        Write-Host '  Compilando...' -ForegroundColor DarkGray
        Push-Location $frontendDir
        cmd /c "npm run build > `"$logsDir\frontend-build.log`" 2>&1"
        $c = $LASTEXITCODE; Pop-Location
        if ($c -ne 0) { throw 'Fallo la compilacion del frontend. Ver logs\frontend-build.log' }
    }
    $next = Join-Path $frontendDir 'node_modules\next\dist\bin\next'
    Start-Process node.exe -ArgumentList "`"$next`" start -p $frontendPort" -WorkingDirectory $frontendDir `
        -RedirectStandardOutput (Join-Path $logsDir 'frontend-out.log') `
        -RedirectStandardError (Join-Path $logsDir 'frontend-err.log') -WindowStyle Hidden | Out-Null
    Esperar-Puerto $frontendPort 'Frontend' 60

    # Verificacion final: la API viva responde 401 sin sesion; la web responde 200
    $api = 0; $web = 0
    try { Invoke-WebRequest "http://localhost:$backendPort/api/v1/ia/perfil" -UseBasicParsing -TimeoutSec 15 | Out-Null } catch { if ($_.Exception.Response) { $api = [int]$_.Exception.Response.StatusCode } }
    try { $web = [int](Invoke-WebRequest "http://localhost:$frontendPort/login" -UseBasicParsing -TimeoutSec 20).StatusCode } catch {}
    if ($api -ne 401 -or $web -ne 200) { throw "Verificacion fallida (API=$api, Web=$web). Revisa la carpeta logs." }
    Write-Host '  [OK] API y pantalla de login responden correctamente' -ForegroundColor Green

    Write-Host ''
    Write-Host '=======================================' -ForegroundColor Green
    Write-Host '   SIGBO-CBVC listo'                       -ForegroundColor Green
    Write-Host '=======================================' -ForegroundColor Green
    Write-Host "  Aplicacion : http://localhost:$frontendPort"
    Write-Host "  API        : http://localhost:$backendPort/api/v1"
    if (-not $NoBrowser) { Start-Process "http://localhost:$frontendPort/login" }
    Pausar
} catch {
    Write-Host ''
    Write-Host 'ERROR AL INICIAR SIGBO-CBVC' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pausar
    exit 1
}
