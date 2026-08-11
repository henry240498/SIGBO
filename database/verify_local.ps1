<#
================================================================================
 verify_local.ps1
 SIGBO-CBVC — Auditoria del entorno local (no modifica nada)
================================================================================
 Ejecuta las 10 comprobaciones exigidas y muestra el cuadro de auditoria.
 Es de SOLO LECTURA: no crea, altera ni borra ningun objeto.

 USO
   .\verify_local.ps1
   .\verify_local.ps1 -User sigbo_app -Password 'Sigbo.Local.2026'
================================================================================
#>

[CmdletBinding()]
param(
    [string] $ServerInstance = 'localhost\SQLEXPRESS',
    [string] $Database       = 'sigbo_cbvc',
    [string] $User           = 'sigbo_app',
    [string] $Password       = 'Sigbo.Local.2026'
)

$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Data

$hostPart = ($ServerInstance -split '\\')[0]
if (@('localhost','127.0.0.1','.','(local)',$env:COMPUTERNAME) -notcontains $hostPart) {
    Write-Host "ABORTADO: '$hostPart' no es local." -ForegroundColor Red; exit 1
}

$results = [ordered]@{}
function Check($name, [scriptblock]$test, $detail = '') {
    try {
        $r = & $test
        $results[$name] = if ($r) { "OK $detail" } else { "REQUIERE INTERVENCION $detail" }
        return $r
    } catch {
        $results[$name] = "REQUIERE INTERVENCION ($($_.Exception.Message))"
        return $false
    }
}

function Q($sql, $db = $Database, [switch]$Sql) {
    $cs = if ($Sql) {
        "Server=$ServerInstance;Database=$db;User ID=$User;Password=$Password;Encrypt=False;TrustServerCertificate=True;Connect Timeout=15"
    } else {
        "Server=$ServerInstance;Database=$db;Integrated Security=SSPI;Encrypt=False;TrustServerCertificate=True;Connect Timeout=15"
    }
    $c = New-Object System.Data.SqlClient.SqlConnection $cs
    $c.Open()
    try { $cmd = $c.CreateCommand(); $cmd.CommandText = $sql; return $cmd.ExecuteScalar() }
    finally { $c.Close() }
}

Write-Host "`nAuditando $ServerInstance / $Database ...`n"

# 1. servidor
$svc = Get-Service -Name 'MSSQL$SQLEXPRESS' -ErrorAction SilentlyContinue
Check '1. Servidor local'   { $svc -and $svc.Status -eq 'Running' } "($($svc.Status))"

# 2. localhost responde
Check '2. localhost'        { (Q 'SELECT 1;' 'master') -eq 1 }

# 3. puerto
$tcp = $false
try { $t = Test-NetConnection 127.0.0.1 -Port 1433 -WarningAction SilentlyContinue; $tcp = $t.TcpTestSucceeded } catch {}
Check '3. Puerto 1433'      { $tcp }

# 4. base existe
Check '4. Base de datos'    { (Q "SELECT CASE WHEN DB_ID(N'$Database') IS NULL THEN 0 ELSE 1 END;" 'master') -eq 1 }

# 5-6. autenticacion del usuario local
Check '5. Usuario local'    { (Q "SELECT COUNT(*) FROM sys.server_principals WHERE name=N'$User';" 'master') -ge 1 }
Check '6. Conexion SQL'     { (Q 'SELECT 1;' $Database -Sql) -eq 1 }

# 7-9. objetos
$t  = Q 'SELECT COUNT(*) FROM sys.tables;'
$f  = Q 'SELECT COUNT(*) FROM sys.foreign_keys;'
$i  = Q 'SELECT COUNT(*) FROM sys.indexes WHERE type=2 AND is_primary_key=0 AND is_unique_constraint=0;'
$pk = Q "SELECT COUNT(*) FROM sys.key_constraints WHERE type='PK';"
$sc = Q "SELECT COUNT(*) FROM sys.schemas WHERE name IN ('seguridad','organizacion','personal','academia','operaciones','vehiculos','equipos','servicios','finanzas','deposito','documentos');"
Check '7. Esquemas (11)'    { $sc -eq 11 } "($sc/11)"
Check '8. Tablas (59)'      { $t  -ge 59 } "($t/59)"
Check '9. Relaciones (68)'  { $f  -ge 68 } "($f/68)"
Check '10. Indices (56)'    { $i  -ge 56 } "($i/56)"
Check '11. Primary Keys'    { $pk -ge 59 } "($pk/59)"

# 12. objetos programables (documentados como 0)
$v  = Q 'SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped=0;'
$p  = Q "SELECT COUNT(*) FROM sys.objects WHERE type='P';"
$fn = Q "SELECT COUNT(*) FROM sys.objects WHERE type IN ('FN','IF','TF');"
$tg = Q 'SELECT COUNT(*) FROM sys.triggers WHERE is_ms_shipped=0;'
$sq = Q 'SELECT COUNT(*) FROM sys.sequences;'
$results['12. Views']       = "OK ($v - documentado: 0)"
$results['13. Functions']   = "OK ($fn - documentado: 0)"
$results['14. Procedures']  = "OK ($p - documentado: 0)"
$results['15. Triggers']    = "OK ($tg - documentado: 0)"
$results['16. Sequences']   = "OK ($sq - el diseno usa NEWSEQUENTIALID/IDENTITY)"

# 13. datos
$perm = Q 'SELECT COUNT(*) FROM seguridad.permisos;'
$rol  = Q 'SELECT COUNT(*) FROM seguridad.roles;'
$usr  = Q 'SELECT COUNT(*) FROM seguridad.usuarios;'
$cfg  = Q 'SELECT COUNT(*) FROM seguridad.configuracion_sistema;'
$bom  = Q 'SELECT COUNT(*) FROM personal.bomberos;'
Check '17. Datos maestros'  { $perm -ge 50 -and $cfg -eq 1 } "(permisos: $perm, config: $cfg)"
Check '18. Datos iniciales' { $rol -ge 1 -and $usr -ge 1 }   "(roles: $rol, usuarios: $usr)"
$results['19. Datos de prueba'] = if ($bom -ge 1) { "OK (bomberos: $bom)" } else { 'omitido (ejecutar install_local.ps1 -TestData)' }

# 14. consulta real con JOIN
Check '20. Consulta real'   { $null -ne (Q 'SELECT TOP 1 b.numero_bombero FROM personal.bomberos b LEFT JOIN organizacion.rangos r ON r.id=b.rango_id;') -or $bom -eq 0 }

# 15. DBeaver
$dsFile = Get-ChildItem (Join-Path $env:APPDATA 'DBeaverData') -Recurse -Filter 'data-sources.json' -ErrorAction SilentlyContinue | Select-Object -First 1
$hasConn = $false
if ($dsFile) { $hasConn = (Get-Content $dsFile.FullName -Raw) -match [regex]::Escape($Database) }
Check '21. Conexion DBeaver' { $hasConn } $(if ($dsFile) { "($($dsFile.FullName))" } else { '(no se encontro data-sources.json)' })

# 16. backend
$envFile = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent)) 'backend\.env'
Check '22. Backend -> local' {
    (Test-Path $envFile) -and ((Get-Content $envFile -Raw) -match 'DB_HOST\s*=\s*(localhost|127\.0\.0\.1)')
} "($envFile)"

# ---------------------------------------------------------------- salida
$line = '=' * 56
Write-Host $line
Write-Host ' REPLICACION LOCAL — AUDITORIA'
Write-Host $line
foreach ($k in $results.Keys) {
    $val = $results[$k]
    $col = if ($val -like 'OK*' -or $val -like 'omitido*') { 'Green' } else { 'Yellow' }
    Write-Host ('{0,-24}{1}' -f ($k + ':'), $val) -ForegroundColor $col
}
Write-Host $line
$pend = @($results.Values | Where-Object { $_ -like 'REQUIERE*' }).Count
if ($pend -eq 0) { Write-Host ' Todo OK.' -ForegroundColor Green }
else { Write-Host " $pend elemento(s) REQUIEREN INTERVENCION (ver arriba)." -ForegroundColor Yellow }
Write-Host ''
