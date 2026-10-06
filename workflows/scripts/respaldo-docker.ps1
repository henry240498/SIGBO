<#
============================================================================
 respaldo-docker.ps1
 SIGBO-CBVC - Respaldo verificable de SQL Server que corre en Docker
============================================================================

 Hace, en este orden, y se detiene en el primer error:
   1. BACKUP COPY_ONLY con CHECKSUM (no altera la cadena de respaldos; Express no admite compresion).
   2. RESTORE VERIFYONLY ... WITH CHECKSUM, dentro de SQL Server.
   3. Copia el .bak al equipo y calcula su SHA-256 (archivo .sha256 al lado).
   4. Con -ProbarRestauracion: restaura el respaldo en una base TEMPORAL
      (sigbo_verif_*), compara la cantidad de tablas con la base real y la
      elimina. Es la unica prueba de que el respaldo SIRVE de verdad.
   5. Retencion: conserva solo los ultimos -Retener respaldos.
   6. Con -CopiarA <carpeta> (por ejemplo un disco externo o pendrive), copia el .bak y su
      .sha256 y VERIFICA la copia comparando el hash. Si la carpeta no esta disponible (disco
      desconectado) lo avisa pero NO invalida el respaldo ya hecho en el equipo.

 Seguridad:
   - La contrasena se toma de MSSQL_SA_PASSWORD (variable de entorno) o de
     .env.sqlserver.local, y viaja al contenedor por entorno (docker exec -e
     NOMBRE, sin valor): no queda en la linea de comandos ni en el historial.
   - El .bak contiene TODOS los datos de la institucion. Guardelo en un lugar
     con acceso restringido y, idealmente, cifrado y fuera de esta PC. Este
     script no cifra ni sube nada a ningun servicio externo.

 Uso:
   .\respaldo-docker.ps1                       # respaldo + verificacion
   .\respaldo-docker.ps1 -ProbarRestauracion   # ademas, restaura de prueba
   .\respaldo-docker.ps1 -Destino D:\Respaldos\SIGBO -Retener 30
============================================================================
#>
[CmdletBinding()]
param(
    [string] $Contenedor = 'sigbo-sqlserver',
    [string] $Base = 'sigbo_cbvc',
    [string] $Destino,
    [int] $Retener = 14,
    [string] $CopiarA,
    [switch] $ProbarRestauracion
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $Destino) { $Destino = Join-Path $raiz 'respaldos' }
if ($Retener -lt 1) { throw '-Retener debe ser 1 o mas.' }
if ($Base -notmatch '^[A-Za-z0-9_]+$') { throw 'Nombre de base no valido.' }

# --- contrasena (solo en el entorno de ESTE proceso) ---
if (-not $env:SQLCMDPASSWORD) {
    $clave = $env:MSSQL_SA_PASSWORD
    if (-not $clave) {
        $archivo = Join-Path $raiz '.env.sqlserver.local'
        if (Test-Path -LiteralPath $archivo) {
            $linea = Select-String -Path $archivo -Pattern '^\s*MSSQL_SA_PASSWORD\s*=\s*(.+?)\s*$' | Select-Object -First 1
            if ($linea) { $clave = $linea.Matches[0].Groups[1].Value }
        }
    }
    if (-not $clave) { throw 'No se encontro MSSQL_SA_PASSWORD (variable de entorno o .env.sqlserver.local).' }
    $env:SQLCMDPASSWORD = $clave
}

function Invoke-Sql([string] $consulta) {
    $salida = & docker exec -e SQLCMDPASSWORD $Contenedor /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -h -1 -W -Q $consulta 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { throw "SQL Server rechazo la operacion:`n$salida" }
    return $salida
}

$estado = (& docker inspect --format '{{.State.Running}}' $Contenedor 2>$null)
if ($estado -ne 'true') { throw "El contenedor $Contenedor no esta en ejecucion (inicie Docker y SQL Server)." }

New-Item -ItemType Directory -Force -Path $Destino | Out-Null
$marca = Get-Date -Format 'yyyyMMdd-HHmmss'
$nombre = "$Base-$marca.bak"
$enContenedor = "/var/opt/mssql/backup/$nombre"

Write-Host "[1/5] Respaldando $Base ..." -ForegroundColor Cyan
& docker exec $Contenedor mkdir -p /var/opt/mssql/backup | Out-Null
Invoke-Sql "BACKUP DATABASE [$Base] TO DISK = N'$enContenedor' WITH COPY_ONLY, CHECKSUM, INIT, NAME = N'SIGBO respaldo $marca'" | Out-Null

try {
    Write-Host '[2/5] Verificando integridad (VERIFYONLY + CHECKSUM) ...' -ForegroundColor Cyan
    Invoke-Sql "RESTORE VERIFYONLY FROM DISK = N'$enContenedor' WITH CHECKSUM" | Out-Null

    Write-Host '[3/5] Copiando al equipo y calculando SHA-256 ...' -ForegroundColor Cyan
    $local = Join-Path $Destino $nombre
    & docker cp "${Contenedor}:$enContenedor" $local
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $local)) { throw 'No se pudo copiar el respaldo fuera del contenedor.' }
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $local).Hash.ToLower()
    [System.IO.File]::WriteAllText("$local.sha256", "$hash  $nombre`n", [System.Text.UTF8Encoding]::new($false))
    $mb = [math]::Round((Get-Item -LiteralPath $local).Length / 1MB, 1)

    if ($ProbarRestauracion) {
        Write-Host '[4/5] Probando la restauracion en una base temporal ...' -ForegroundColor Cyan
        $temporal = "sigbo_verif_$marca"
        try {
            $archivos = Invoke-Sql "RESTORE FILELISTONLY FROM DISK = N'$enContenedor'"
            $mover = @()
            foreach ($linea in ($archivos -split "`r?`n")) {
                $c = $linea -split '\s+'
                if ($c.Count -ge 3 -and ($c[2] -eq 'D' -or $c[2] -eq 'L')) {
                    $ext = if ($c[2] -eq 'L') { 'ldf' } else { 'mdf' }
                    $mover += "MOVE N'$($c[0])' TO N'/var/opt/mssql/data/${temporal}_$($c[0]).$ext'"
                }
            }
            if ($mover.Count -eq 0) { throw 'No se pudo leer la estructura del respaldo.' }
            Invoke-Sql "RESTORE DATABASE [$temporal] FROM DISK = N'$enContenedor' WITH $($mover -join ', '), REPLACE" | Out-Null
            $tablasOriginal = [int](Invoke-Sql "SET NOCOUNT ON; SELECT COUNT(*) FROM [$Base].sys.tables").Trim()
            $tablasRestauradas = [int](Invoke-Sql "SET NOCOUNT ON; SELECT COUNT(*) FROM [$temporal].sys.tables").Trim()
            if ($tablasOriginal -ne $tablasRestauradas -or $tablasRestauradas -eq 0) {
                throw "La base restaurada no coincide con la original (tablas: $tablasRestauradas vs $tablasOriginal)."
            }
            Write-Host "      Restauracion correcta: $tablasRestauradas tablas, igual que la base real." -ForegroundColor Green
        } finally {
            & docker exec -e SQLCMDPASSWORD $Contenedor /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -Q "IF DB_ID(N'$temporal') IS NOT NULL BEGIN ALTER DATABASE [$temporal] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$temporal]; END" 2>&1 | Out-Null
        }
    } else {
        Write-Host '[4/5] (omitido) Use -ProbarRestauracion para restaurar de prueba.' -ForegroundColor DarkGray
    }
} finally {
    & docker exec $Contenedor rm -f $enContenedor 2>&1 | Out-Null
}

Write-Host "[5/5] Retencion: se conservan los ultimos $Retener respaldos ..." -ForegroundColor Cyan
$viejos = Get-ChildItem -LiteralPath $Destino -Filter "$Base-*.bak" | Sort-Object Name -Descending | Select-Object -Skip $Retener
foreach ($v in $viejos) {
    Remove-Item -LiteralPath $v.FullName -Force
    Remove-Item -LiteralPath "$($v.FullName).sha256" -Force -ErrorAction SilentlyContinue
}

$copiaOk = $null
if ($CopiarA) {
    Write-Host "[+] Copiando a $CopiarA ..." -ForegroundColor Cyan
    try {
        if (-not (Test-Path -LiteralPath $CopiarA)) { throw "La carpeta $CopiarA no esta disponible (disco o pendrive desconectado)." }
        Copy-Item -LiteralPath $local, "$local.sha256" -Destination $CopiarA -Force
        $copiado = Join-Path $CopiarA $nombre
        $hashCopia = (Get-FileHash -Algorithm SHA256 -LiteralPath $copiado).Hash.ToLower()
        if ($hashCopia -ne $hash) { Remove-Item -LiteralPath $copiado -Force; throw 'La copia no coincide con el original (se descarto).' }
        $viejosCopia = Get-ChildItem -LiteralPath $CopiarA -Filter "$Base-*.bak" | Sort-Object Name -Descending | Select-Object -Skip $Retener
        foreach ($v in $viejosCopia) {
            Remove-Item -LiteralPath $v.FullName -Force
            Remove-Item -LiteralPath "$($v.FullName).sha256" -Force -ErrorAction SilentlyContinue
        }
        $copiaOk = $true
        Write-Host '      Copia verificada.' -ForegroundColor Green
    } catch {
        $copiaOk = $false
        Write-Host "AVISO: no se pudo copiar fuera de la PC: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host "Respaldo listo: $local ($mb MB)" -ForegroundColor Green
if ($copiaOk -eq $false) { Write-Host 'ATENCION: el respaldo esta SOLO en esta PC.' -ForegroundColor Yellow }
Write-Host "SHA-256: $hash"
