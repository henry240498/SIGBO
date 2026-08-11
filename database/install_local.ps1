<#
================================================================================
 install_local.ps1
 SIGBO-CBVC — Instalacion COMPLETA de la base de datos en el equipo LOCAL
================================================================================
 Motor destino : Microsoft SQL Server 2019 Express (instancia local)
 Base de datos : sigbo_cbvc
 Host          : localhost  (nunca un host remoto — ver bloque de guarda)

 QUE HACE, EN ORDEN
   1. Verifica que se ejecute como Administrador (necesario para tocar el
      servicio y la configuracion de red de la instancia).
   2. Detecta la instancia local de SQL Server en el registro.
   3. Arranca el servicio si esta detenido.
   4. Habilita TCP/IP en el puerto 1433 (SQL Server Express lo trae
      deshabilitado; DBeaver lo necesita porque su driver JDBC no usa
      memoria compartida).
   5. Habilita autenticacion mixta (SQL + Windows) si hace falta.
   6. Reinicia el servicio solo si algo del paso 4/5 cambio.
   7. Crea la base sigbo_cbvc y ejecuta los scripts 01..14 en orden.
   8. Ejecuta 15 (bootstrap local) y, con -TestData, 16 (datos de prueba).
   9. Crea el login local sigbo_app y lo mapea como db_owner de sigbo_cbvc.
  10. Ejecuta la validacion y muestra la auditoria final.

 USO
   # Todo, con datos de prueba (recomendado la primera vez):
   .\install_local.ps1 -TestData

   # Solo estructura + datos maestros replicados:
   .\install_local.ps1

   # Recrear desde cero (BORRA la base local sigbo_cbvc):
   .\install_local.ps1 -Recreate -TestData

   # Con una contrasena propia para el login de aplicacion:
   .\install_local.ps1 -TestData -AppPassword 'MiClaveLocal.2026'

 REGLA DE SEGURIDAD
   El script SOLO opera contra la instancia local. Si -ServerInstance
   apunta a algo que no sea localhost / 127.0.0.1 / . / (local) o el
   nombre de esta misma maquina, aborta sin ejecutar nada.
================================================================================
#>

[CmdletBinding()]
param(
    # Instancia local. Se autodetecta si no se especifica.
    [string] $ServerInstance,

    # Nombre de la base. Definido por el proyecto: sigbo_cbvc.
    [string] $Database = 'sigbo_cbvc',

    # Login SQL local que usara DBeaver / el backend.
    [string] $AppLogin = 'sigbo_app',

    # Contrasena del login local. Si se omite se usa la de por defecto.
    [string] $AppPassword = 'Sigbo.Local.2026',

    # Carpeta con los scripts .sql
    [string] $ScriptsPath = (Join-Path $PSScriptRoot 'scripts'),

    # Insertar tambien los datos de prueba sinteticos (16_insert_test_data.sql)
    [switch] $TestData,

    # DROP DATABASE previo. Destructivo, solo local.
    [switch] $Recreate,

    # No tocar TCP/IP ni LoginMode (util si ya estan configurados a mano)
    [switch] $SkipServerConfig
)

$ErrorActionPreference = 'Stop'
$script:Report = [ordered]@{}
$script:Changed = $false

function Say    ($m) { Write-Host $m }
function Step   ($m) { Write-Host "`n>> $m" -ForegroundColor Cyan }
function Ok     ($m) { Write-Host "   [OK]   $m" -ForegroundColor Green }
function Warn2  ($m) { Write-Host "   [WARN] $m" -ForegroundColor Yellow }
function Fail   ($m) { Write-Host "   [ERR]  $m" -ForegroundColor Red }

# ------------------------------------------------------------------ 0. guardas
Step '0. Verificaciones previas'

$isAdmin = ([Security.Principal.WindowsPrincipal] `
            [Security.Principal.WindowsIdentity]::GetCurrent()
           ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin -and -not $SkipServerConfig) {
    Fail 'Este script necesita ejecutarse como Administrador para configurar TCP/IP y el modo de autenticacion.'
    Say  ''
    Say  '  Abri PowerShell como Administrador y volve a ejecutarlo:'
    Say  "     cd `"$PSScriptRoot`""
    Say  "     .\install_local.ps1$(if($TestData){' -TestData'})"
    Say  ''
    Say  '  (O ejecutalo con -SkipServerConfig si ya configuraste TCP/IP 1433 y'
    Say  '   la autenticacion mixta desde SQL Server Configuration Manager.)'
    exit 1
}
Ok ("Sesion elevada: {0}" -f $(if ($isAdmin) { 'si' } else { 'no (SkipServerConfig)' }))

if (-not (Test-Path $ScriptsPath)) { throw "No se encuentra la carpeta de scripts: $ScriptsPath" }
Ok "Scripts: $ScriptsPath"

# ------------------------------------------------- 1. detectar instancia local
Step '1. Detectar la instancia local de SQL Server'

$regInst = 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL'
if (-not (Test-Path $regInst)) {
    Fail 'No hay ninguna instancia de SQL Server instalada en este equipo.'
    Say  ''
    Say  '  QUE FALTA : el motor SQL Server (el proyecto usa SQL Server 2019 Express).'
    Say  '  QUE HACER : instalar SQL Server 2019 Express desde'
    Say  '              https://www.microsoft.com/es-es/sql-server/sql-server-downloads'
    Say  '              (edicion Express, instalacion "Basica"), y volver a ejecutar este script.'
    Say  '  COMPROBAR : Get-Service -Name "MSSQL*"  debe listar el servicio.'
    exit 1
}

$instances = Get-ItemProperty $regInst
$instNames = $instances.PSObject.Properties |
             Where-Object { $_.Name -notlike 'PS*' } |
             Select-Object -ExpandProperty Name

Say ("   Instancias encontradas: {0}" -f ($instNames -join ', '))

if (-not $ServerInstance) {
    $pick = if ($instNames -contains 'SQLEXPRESS') { 'SQLEXPRESS' } else { $instNames[0] }
    $ServerInstance = if ($pick -eq 'MSSQLSERVER') { 'localhost' } else { "localhost\$pick" }
    $instanceName   = $pick
} else {
    $instanceName = if ($ServerInstance -match '\\(.+)$') { $Matches[1] } else { 'MSSQLSERVER' }
}

# --- GUARDA DE LOCALIDAD ------------------------------------------------------
$hostPart = ($ServerInstance -split '\\')[0]
$localOk  = @('localhost', '127.0.0.1', '.', '(local)', '(localdb)', $env:COMPUTERNAME)
if ($localOk -notcontains $hostPart) {
    Fail "ABORTADO: '$hostPart' no es local. Este script no opera sobre servidores remotos."
    exit 1
}
Ok "Instancia local: $ServerInstance  (host '$hostPart' verificado como local)"

$regKey  = $instances.$instanceName          # ej. MSSQL15.SQLEXPRESS
$svcName = if ($instanceName -eq 'MSSQLSERVER') { 'MSSQLSERVER' } else { "MSSQL`$$instanceName" }
$verNum  = if ($regKey -match 'MSSQL(\d+)\.') { [int]$Matches[1] } else { 0 }
$verName = switch ($verNum) {
    15 { 'SQL Server 2019' } 16 { 'SQL Server 2022' } 14 { 'SQL Server 2017' }
    13 { 'SQL Server 2016' } default { "MSSQL$verNum" }
}
Ok "Clave de registro: $regKey  ($verName)  |  Servicio: $svcName"
$script:Report['Motor']    = "Microsoft SQL Server ($verName, instancia $instanceName)"
$script:Report['Servidor'] = $ServerInstance

# ------------------------------------------------------ 2. servicio arriba
Step '2. Servicio del motor'
$svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
if (-not $svc) { throw "No se encuentra el servicio $svcName." }
if ($svc.Status -ne 'Running') {
    Say "   Servicio detenido, iniciando..."
    Start-Service $svcName
    (Get-Service $svcName).WaitForStatus('Running', '00:01:00')
    Ok 'Servicio iniciado.'
} else { Ok 'Servicio ya estaba en ejecucion.' }

if ($svc.StartType -eq 'Disabled' -or $svc.StartType -eq 'Manual') {
    try { Set-Service -Name $svcName -StartupType Automatic
          Ok 'Inicio del servicio cambiado a Automatico.' } catch { Warn2 $_.Exception.Message }
}

# --------------------------------------------- 3. TCP/IP 1433 + modo mixto
if (-not $SkipServerConfig) {
    Step '3. Configuracion de red y autenticacion de la instancia'
    $base = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$regKey\MSSQLServer"

    # --- TCP/IP habilitado
    $tcp = "$base\SuperSocketNetLib\Tcp"
    if (Test-Path $tcp) {
        if ((Get-ItemProperty $tcp).Enabled -ne 1) {
            Set-ItemProperty $tcp -Name Enabled -Value 1
            $script:Changed = $true; Ok 'Protocolo TCP/IP habilitado.'
        } else { Ok 'Protocolo TCP/IP ya estaba habilitado.' }

        # --- puerto estatico 1433 en IPAll
        $ipall = "$tcp\IPAll"
        $cur   = Get-ItemProperty $ipall
        if ($cur.TcpPort -ne '1433') {
            Set-ItemProperty $ipall -Name TcpPort -Value '1433'
            $script:Changed = $true; Ok 'Puerto estatico 1433 configurado (IPAll).'
        } else { Ok 'Puerto 1433 ya configurado.' }
        if ($cur.TcpDynamicPorts -ne '') {
            Set-ItemProperty $ipall -Name TcpDynamicPorts -Value ''
            $script:Changed = $true; Ok 'Puertos dinamicos desactivados.'
        }
        # --- IP1 (loopback) habilitada
        $ip1 = "$tcp\IP1"
        if (Test-Path $ip1) {
            if ((Get-ItemProperty $ip1).Enabled -ne 1) {
                Set-ItemProperty $ip1 -Name Enabled -Value 1
                $script:Changed = $true; Ok 'IP loopback (IP1) habilitada.'
            }
        }
    } else { Warn2 "No se encuentra $tcp — se omite la configuracion de red." }

    # --- autenticacion mixta (LoginMode 2)
    $lm = (Get-ItemProperty $base -Name LoginMode -ErrorAction SilentlyContinue).LoginMode
    if ($lm -ne 2) {
        Set-ItemProperty $base -Name LoginMode -Value 2
        $script:Changed = $true
        Ok 'Autenticacion mixta (SQL + Windows) habilitada.'
    } else { Ok 'Autenticacion mixta ya estaba habilitada.' }

    if ($script:Changed) {
        Say '   Reiniciando el servicio para aplicar los cambios...'
        Restart-Service $svcName -Force
        (Get-Service $svcName).WaitForStatus('Running', '00:02:00')
        Start-Sleep -Seconds 3
        Ok 'Servicio reiniciado.'
    } else { Ok 'Sin cambios: no hace falta reiniciar.' }
} else {
    Step '3. Configuracion de red y autenticacion — OMITIDA (-SkipServerConfig)'
}

# --------------------------------------------------- 4. runner T-SQL propio
# Usa System.Data.SqlClient directamente: no depende de sqlcmd ni del modulo
# SqlServer, que no siempre vienen con SQL Server Express.
Add-Type -AssemblyName System.Data

function New-SqlConnection {
    param([string]$Db = 'master', [switch]$Sql, [string]$User, [string]$Pass)
    $cs = if ($Sql) {
        "Server=$ServerInstance;Database=$Db;User ID=$User;Password=$Pass;" +
        "Encrypt=False;TrustServerCertificate=True;Connect Timeout=30"
    } else {
        "Server=$ServerInstance;Database=$Db;Integrated Security=SSPI;" +
        "Encrypt=False;TrustServerCertificate=True;Connect Timeout=30"
    }
    $c = New-Object System.Data.SqlClient.SqlConnection $cs
    $c.Open()
    return $c
}

function Split-SqlBatches {
    param([string]$Sql)
    # divide por 'GO' en linea propia, respetando comentarios de bloque
    $lines  = $Sql -split "`r?`n"
    $out    = New-Object System.Collections.ArrayList
    $buf    = New-Object System.Text.StringBuilder
    $inBlock = $false
    foreach ($l in $lines) {
        $t = $l.Trim()
        if (-not $inBlock -and $t -match '/\*' -and $t -notmatch '\*/') { $inBlock = $true }
        elseif ($inBlock -and $t -match '\*/') { $inBlock = $false }
        if (-not $inBlock -and $t -match '^GO\s*(--.*)?$') {
            [void]$out.Add($buf.ToString()); $buf = New-Object System.Text.StringBuilder
        } else { [void]$buf.AppendLine($l) }
    }
    [void]$out.Add($buf.ToString())
    return $out | Where-Object { $_ -match '\S' }
}

function Invoke-SqlFile {
    param([string]$Path, [string]$Db = 'master', [switch]$ShowResults)
    $name = Split-Path $Path -Leaf
    $sql  = Get-Content -Path $Path -Raw -Encoding UTF8
    $conn = New-SqlConnection -Db $Db
    $n = 0; $affected = 0
    try {
        foreach ($b in (Split-SqlBatches $sql)) {
            $n++
            $cmd = $conn.CreateCommand()
            $cmd.CommandText = $b
            $cmd.CommandTimeout = 300
            try {
                if ($ShowResults) {
                    $rd = $cmd.ExecuteReader()
                    $guard = 0
                    while (-not $rd.IsClosed -and $guard -lt 50) {
                        $guard++
                        $tbl = New-Object System.Data.DataTable
                        try { $tbl.Load($rd) } catch { break }
                        if ($tbl.Rows.Count -gt 0) { $tbl | Format-Table -AutoSize | Out-String | Write-Host }
                        elseif ($tbl.Columns.Count -eq 0) { break }
                    }
                    if (-not $rd.IsClosed) { $rd.Close() }
                } else {
                    $a = $cmd.ExecuteNonQuery()
                    if ($a -gt 0) { $affected += $a }
                }
            } catch {
                Fail "$name — lote #$n"
                Write-Host ("        " + $_.Exception.Message) -ForegroundColor Red
                throw
            }
        }
    } finally { $conn.Close() }
    Ok ("{0,-32} {1,3} lotes, {2,5} filas afectadas" -f $name, $n, $affected)
}

function Invoke-SqlScalar {
    param([string]$Query, [string]$Db = 'master')
    $conn = New-SqlConnection -Db $Db
    try { $cmd = $conn.CreateCommand(); $cmd.CommandText = $Query; return $cmd.ExecuteScalar() }
    finally { $conn.Close() }
}

function Invoke-SqlQuery {
    param([string]$Query, [string]$Db = 'master')
    $conn = New-SqlConnection -Db $Db
    try {
        $cmd = $conn.CreateCommand(); $cmd.CommandText = $Query
        $da  = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
        $dt  = New-Object System.Data.DataTable
        [void]$da.Fill($dt); return $dt
    } finally { $conn.Close() }
}

# ------------------------------------------------------ 5. prueba SELECT 1
Step '4. Probar la conexion al motor (SELECT 1)'
try {
    $one = Invoke-SqlScalar 'SELECT 1;'
    $ver = Invoke-SqlScalar "SELECT CONCAT(CAST(SERVERPROPERTY('ProductVersion') AS NVARCHAR(50)),' / ',CAST(SERVERPROPERTY('Edition') AS NVARCHAR(80)));"
    Ok "SELECT 1 -> $one"
    Ok "Version: $ver"
    $script:Report['Version'] = $ver
} catch {
    Fail 'No se pudo conectar a la instancia local.'
    Say  "  $($_.Exception.Message)"
    Say  ''
    Say  ("  COMPROBAR: Get-Service '{0}'" -f $svcName)
    Say  ("             sqlcmd -S {0} -E -Q `"SELECT 1`"" -f $ServerInstance)
    exit 1
}

# --------------------------------------------------------- 6. crear la base
Step '5. Base de datos'
function Test-DbExists {
    return ([int](Invoke-SqlScalar "SELECT CASE WHEN DB_ID(N'$Database') IS NULL THEN 0 ELSE 1 END;")) -eq 1
}

if ($Recreate) {
    if (Test-DbExists) {
        Warn2 "-Recreate: eliminando la base local $Database ..."
        Invoke-SqlScalar "ALTER DATABASE [$Database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$Database];" | Out-Null
        Ok "Base $Database eliminada."
    }
}

# ------------------------------------------------------- 7. ejecutar scripts
Step '6. Ejecutar los scripts de reconstruccion'

$order = @(
    @{ f = '01_create_database.sql';    db = 'master'   },
    @{ f = '02_create_schemas.sql';     db = $Database  },
    @{ f = '03_create_types.sql';       db = $Database  },
    @{ f = '04_create_tables.sql';      db = $Database  },
    @{ f = '05_create_sequences.sql';   db = $Database  },
    @{ f = '06_create_constraints.sql'; db = $Database  },
    @{ f = '07_create_indexes.sql';     db = $Database  },
    @{ f = '08_create_functions.sql';   db = $Database  },
    @{ f = '09_create_procedures.sql';  db = $Database  },
    @{ f = '10_create_triggers.sql';    db = $Database  },
    @{ f = '11_create_views.sql';       db = $Database  },
    @{ f = '12_insert_master_data.sql'; db = $Database  },
    @{ f = '13_insert_initial_data.sql';db = $Database  },
    @{ f = '15_bootstrap_local.sql';    db = $Database  }
)
if ($TestData) { $order += @{ f = '16_insert_test_data.sql'; db = $Database } }

foreach ($s in $order) {
    $p = Join-Path $ScriptsPath $s.f
    if (-not (Test-Path $p)) { Warn2 "No existe $($s.f), se omite."; continue }
    # 01 crea la base; a partir de ahi conectamos ya contra sigbo_cbvc
    Invoke-SqlFile -Path $p -Db $s.db
}

# ------------------------------------------------- 8. login local + permisos
Step '7. Login local para DBeaver y el backend'

$escPass = $AppPassword.Replace("'", "''")
$loginSql = @"
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'$AppLogin')
BEGIN
    CREATE LOGIN [$AppLogin] WITH PASSWORD = N'$escPass',
        DEFAULT_DATABASE = [$Database],
        CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
END
ELSE
BEGIN
    ALTER LOGIN [$AppLogin] WITH PASSWORD = N'$escPass', DEFAULT_DATABASE = [$Database];
    ALTER LOGIN [$AppLogin] ENABLE;
END
"@
Invoke-SqlScalar $loginSql | Out-Null
Ok "Login SQL '$AppLogin' creado/actualizado."

$userSql = @"
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'$AppLogin')
    CREATE USER [$AppLogin] FOR LOGIN [$AppLogin];
ALTER ROLE db_owner ADD MEMBER [$AppLogin];
"@
Invoke-SqlScalar $userSql -Db $Database | Out-Null
Ok "Usuario '$AppLogin' mapeado como db_owner de $Database."

# prueba real de autenticacion SQL
try {
    $c = New-SqlConnection -Db $Database -Sql -User $AppLogin -Pass $AppPassword
    $cmd = $c.CreateCommand(); $cmd.CommandText = 'SELECT DB_NAME();'
    $dbn = $cmd.ExecuteScalar(); $c.Close()
    Ok "Autenticacion SQL verificada: $AppLogin -> $dbn"
    $script:Report['AuthSQL'] = 'OK'
} catch {
    Fail "El login $AppLogin no puede autenticarse: $($_.Exception.Message)"
    Warn2 'Revisa que la autenticacion mixta este activa (LoginMode = 2) y que el servicio se haya reiniciado.'
    $script:Report['AuthSQL'] = 'FALLO'
}

# ------------------------------------------------------- 9. puerto 1433 vivo
Step '8. Verificar el puerto TCP local 1433'
$tcpOk = $false
try {
    $t = Test-NetConnection -ComputerName 127.0.0.1 -Port 1433 -WarningAction SilentlyContinue
    $tcpOk = $t.TcpTestSucceeded
} catch {
    try { $s = New-Object System.Net.Sockets.TcpClient; $s.Connect('127.0.0.1', 1433); $tcpOk = $s.Connected; $s.Close() } catch {}
}
if ($tcpOk) { Ok '127.0.0.1:1433 responde (DBeaver podra conectarse).' }
else {
    Warn2 '127.0.0.1:1433 NO responde.'
    Say  '  QUE HACER: abrir "SQL Server Configuration Manager" -> Protocolos de'
    Say  "             $instanceName -> TCP/IP -> Habilitado = Si; pestana Direcciones IP ->"
    Say  '             IPAll -> Puertos TCP = 1433, Puertos TCP dinamicos = (vacio);'
    Say  "             luego: Restart-Service '$svcName'"
    Say  '  COMPROBAR: Test-NetConnection 127.0.0.1 -Port 1433'
}
$script:Report['Puerto1433'] = $(if ($tcpOk) { 'OK' } else { 'REQUIERE INTERVENCION' })

# ------------------------------------------ 9b. apuntar el backend a localhost
Step '9. Configuracion del backend y del frontend (apuntar a localhost)'

$repoRoot   = Split-Path $PSScriptRoot -Parent
$backendDir = Join-Path $repoRoot 'backend'
$frontDir   = Join-Path $repoRoot 'frontend'

function New-Secret {
    $b = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
    return [Convert]::ToBase64String($b)
}

if (Test-Path $backendDir) {
    $envFile = Join-Path $backendDir '.env'
    $tpl     = Join-Path $backendDir '.env.example'
    if (Test-Path $envFile) {
        Warn2 "backend\.env ya existe: no se sobrescribe. Verifica a mano que DB_HOST=localhost y DB_PASSWORD sean correctos."
    } elseif (Test-Path $tpl) {
        $c = Get-Content $tpl -Raw -Encoding UTF8
        $c = $c -replace 'DB_PASSWORD=.*',         ("DB_PASSWORD=" + $AppPassword)
        $c = $c -replace 'DB_USER=.*',             ("DB_USER=" + $AppLogin)
        $c = $c -replace 'DB_NAME=.*',             ("DB_NAME=" + $Database)
        $c = $c -replace 'JWT_SECRET=.*',          ("JWT_SECRET=" + (New-Secret))
        $c = $c -replace 'JWT_REFRESH_SECRET=.*',  ("JWT_REFRESH_SECRET=" + (New-Secret))
        $c = $c -replace '# Copiar a \.env y ajustar\.', '# Generado por install_local.ps1 en este equipo.'
        Set-Content -Path $envFile -Value $c -Encoding UTF8
        Ok "backend\.env generado (DB_HOST=localhost, DB_NAME=$Database, DB_USER=$AppLogin, secretos JWT nuevos)."
    } else {
        Warn2 'No se encuentra backend\.env.example: no se pudo generar backend\.env.'
    }
} else { Warn2 "No existe $backendDir; se omite la configuracion del backend." }

if (Test-Path $frontDir) {
    $fenv = Join-Path $frontDir '.env.local'
    if (-not (Test-Path $fenv)) {
        @(
          '# SIGBO-CBVC - Frontend (Next.js 14) - entorno LOCAL',
          '# El frontend no habla con la base de datos: habla con el backend NestJS',
          '# que corre en localhost:3001 (backend/src/main.ts -> app.listen(3001)).',
          '',
          'NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1'
        ) | Set-Content -Path $fenv -Encoding UTF8
        Ok 'frontend\.env.local generado (apunta a http://localhost:3001).'
    } else { Ok 'frontend\.env.local ya existia: no se toca.' }
}

# ---------------------------------------------------------- 10. validacion
Step '10. Validacion de la replica'
$val = Join-Path $ScriptsPath '14_validation.sql'
if (Test-Path $val) { Invoke-SqlFile -Path $val -Db $Database -ShowResults }

$counts = Invoke-SqlQuery @"
SELECT
  (SELECT COUNT(*) FROM sys.schemas WHERE name IN ('seguridad','organizacion','personal','academia','operaciones','vehiculos','equipos','servicios','finanzas','deposito','documentos')) AS esquemas,
  (SELECT COUNT(*) FROM sys.tables)                                        AS tablas,
  (SELECT COUNT(*) FROM sys.columns c JOIN sys.tables t ON t.object_id=c.object_id) AS columnas,
  (SELECT COUNT(*) FROM sys.key_constraints WHERE type='PK')               AS pks,
  (SELECT COUNT(*) FROM sys.foreign_keys)                                  AS fks,
  (SELECT COUNT(*) FROM sys.indexes WHERE type=2 AND is_primary_key=0 AND is_unique_constraint=0) AS indices,
  (SELECT COUNT(*) FROM sys.check_constraints)                             AS checks,
  (SELECT COUNT(*) FROM sys.key_constraints WHERE type='UQ')               AS uniques,
  (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped=0)                   AS vistas,
  (SELECT COUNT(*) FROM sys.objects WHERE type='P')                        AS procedures,
  (SELECT COUNT(*) FROM sys.objects WHERE type IN ('FN','IF','TF'))        AS functions,
  (SELECT COUNT(*) FROM sys.triggers WHERE is_ms_shipped=0)                AS triggers,
  (SELECT COUNT(*) FROM sys.sequences)                                     AS sequences,
  (SELECT COUNT(*) FROM seguridad.permisos)                                AS permisos,
  (SELECT COUNT(*) FROM seguridad.roles)                                   AS roles,
  (SELECT COUNT(*) FROM seguridad.usuarios)                                AS usuarios,
  (SELECT COUNT(*) FROM seguridad.configuracion_sistema)                   AS config,
  (SELECT COUNT(*) FROM personal.bomberos)                                 AS bomberos
"@ -Db $Database
$r = $counts.Rows[0]

# consulta real sobre tablas principales (no solo SELECT 1)
$joinTest = Invoke-SqlQuery @"
SELECT TOP 5 b.numero_bombero, b.nombre, b.apellido, r.nombre AS rango,
       c.nombre AS compania, q.nombre AS cuartel, b.antiguedad
FROM personal.bomberos b
LEFT JOIN organizacion.rangos    r ON r.id = b.rango_id
LEFT JOIN organizacion.companias c ON c.id = b.compania_id
LEFT JOIN organizacion.cuarteles q ON q.id = b.cuartel_id
ORDER BY b.numero_bombero;
"@ -Db $Database

# ------------------------------------------------------------ 11. auditoria
function Mark($cond) { if ($cond) { 'OK' } else { 'REQUIERE INTERVENCION' } }

$line = '=' * 52
Write-Host ''
Write-Host $line
Write-Host ' REPLICACION LOCAL'
Write-Host $line
$rows = [ordered]@{
  'Base de datos'     = Mark (Test-DbExists)
  'Motor'             = 'OK'
  'Servidor local'    = Mark ((Get-Service $svcName).Status -eq 'Running')
  'Puerto'            = $script:Report['Puerto1433']
  'Usuario'           = Mark ((Invoke-SqlScalar "SELECT COUNT(*) FROM sys.server_principals WHERE name=N'$AppLogin';") -ge 1)
  'Autenticacion'     = Mark ($script:Report['AuthSQL'] -eq 'OK')
  'Tablas'            = "$(Mark ($r.tablas -ge 59)) ($($r.tablas)/59)"
  'Columnas'          = "OK ($($r.columnas))"
  'Relaciones'        = "$(Mark ($r.fks -ge 68)) ($($r.fks)/68)"
  'Indices'           = "$(Mark ($r.indices -ge 56)) ($($r.indices)/56)"
  'Primary Keys'      = "$(Mark ($r.pks -ge 59)) ($($r.pks)/59)"
  'Unique'            = "OK ($($r.uniques))"
  'Check'             = "OK ($($r.checks))"
  'Sequences'         = "OK ($($r.sequences) - el diseno usa NEWSEQUENTIALID/IDENTITY)"
  'Functions'         = "OK ($($r.functions) - documentado: 0)"
  'Procedures'        = "OK ($($r.procedures) - documentado: 0)"
  'Triggers'          = "OK ($($r.triggers) - documentado: 0)"
  'Views'             = "OK ($($r.vistas) - documentado: 0)"
  'Datos maestros'    = "$(Mark ($r.permisos -ge 50)) (permisos: $($r.permisos), config: $($r.config))"
  'Datos iniciales'   = "$(Mark ($r.roles -ge 1 -and $r.usuarios -ge 1)) (roles: $($r.roles), usuarios: $($r.usuarios))"
  'Datos de prueba'   = $(if ($TestData) { "$(Mark ($r.bomberos -ge 1)) (bomberos: $($r.bomberos))" } else { 'omitido (-TestData no usado)' })
}
foreach ($k in $rows.Keys) { '{0,-20}{1}' -f ($k + ':'), $rows[$k] | Write-Host }
Write-Host $line

Write-Host ''
Write-Host 'Consulta real sobre las tablas principales (JOIN bomberos/rangos/companias/cuarteles):'
if ($joinTest.Rows.Count -gt 0) { $joinTest | Format-Table -AutoSize | Out-String | Write-Host }
else { Write-Host '  (sin filas: ejecutar con -TestData para cargar datos de prueba)' }

Write-Host ''
Write-Host 'DATOS DE CONEXION PARA DBEAVER' -ForegroundColor Cyan
Write-Host "  Host      : localhost"
Write-Host "  Puerto    : 1433"
Write-Host "  Database  : $Database"
Write-Host "  Usuario   : $AppLogin"
Write-Host "  Password  : $AppPassword"
Write-Host "  Driver    : Microsoft SQL Server (mssql_jdbc_ms_new)"
Write-Host "  URL JDBC  : jdbc:sqlserver://localhost:1433;databaseName=$Database;encrypt=false;trustServerCertificate=true"
Write-Host ''
Write-Host 'Para crear la conexion automaticamente en DBeaver (cerra DBeaver antes):'
Write-Host "  .\setup_dbeaver.ps1 -Database $Database -User $AppLogin -Password '$AppPassword'"
Write-Host ''
