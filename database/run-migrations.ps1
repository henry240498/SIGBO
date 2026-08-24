<#
    SIGBO-CBVC - Ejecutor de migraciones para SQL Server

    Uso:
      .\run-migrations.ps1 [-Server ".\SQLEXPRESS"] [-Database "sigbo_cbvc"]
      .\run-migrations.ps1 -ValidateOnly

    Las migraciones históricas crean la base sigbo_cbvc de forma explícita.
    El ejecutor guarda el hash de cada script aplicado para que una siguiente
    ejecución sólo aplique migraciones nuevas y detecte cambios incompatibles.
#>
[CmdletBinding()]
param(
    [string]$Server = ".\SQLEXPRESS",
    [string]$Database = "sigbo_cbvc",
    [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"
$migrationsDir = Join-Path $PSScriptRoot "migrations"
$databaseCanonica = "sigbo_cbvc"

Write-Host "=== SIGBO-CBVC: ejecutando migraciones ===" -ForegroundColor Cyan
Write-Host "Servidor: $Server" -ForegroundColor DarkGray

# Hay prefijos históricos duplicados (por ejemplo 017 y 023). El manifiesto
# explícito impide que el orden dependa del filesystem.
$ordenMigraciones = @(
    "001_schemas.sql",
    "002_seguridad.sql",
    "003_personal.sql",
    "004_academia.sql",
    "005_operaciones.sql",
    "006_vehiculos_equipos.sql",
    "007_servicios.sql",
    "008_admin.sql",
    "009_foreign_keys.sql",
    "010_indices.sql",
    "011_seguridad_fase1.sql",
    "012_organizacion.sql",
    "013_apariencia_login.sql",
    "014_configuracion_sistema.sql",
    "015_perfil_usuario.sql",
    "016_personal_expansion.sql",
    "017_comunicaciones_servicio.sql",
    "017_tipos_bombero.sql",
    "018_parametros_y_normalizacion_personal.sql",
    "019_ajuste_tipos_bombero.sql",
    "020_asistencia.sql",
    "021_configuracion_integral.sql",
    "022_permiso_publicaciones.sql",
    "023_moviles.sql",
    "023_publicaciones_persistencia.sql",
    "024_equipos.sql",
    "024_personal_reconciliacion_segura.sql",
    "025_guardias.sql",
    "026_guardias_planificacion.sql",
    "026_publicaciones_persistencia.sql",
    "027_guardias_generacion.sql",
    "027_personal_reconciliacion_segura.sql",
    "028_guardias_sorteo.sql",
    "029_guardias_moviles_bitacora.sql",
    "030_ordenes_guardia.sql",
    "031_denuncias_rapidas.sql",
    "031_identidad_institucional.sql",
    "032_personal_autorizacion_firma.sql",
    "033_orden_guardia_drop_columnas_redundantes.sql",
    "034_grupos_guardia_dias_fijos.sql",
    "035_roles_acceso_total.sql",
    "036_academia_estructura.sql",
    "037_academia_integracion_asistencia_certificaciones.sql",
    "038_academia_limpieza_tablas_legadas.sql",
    "039_academia_historial_institucional.sql",
    "040_academia_cursos_externos_cache.sql",
    "041_deposito_estructura.sql",
    "042_deposito_entradas.sql",
    "043_deposito_bajas.sql",
    "044_deposito_prestamos.sql",
    "045_deposito_inventario_fisico.sql",
    "046_deposito_mantenimientos.sql",
    "047_deposito_permiso_parametros.sql",
    "048_finanzas_estructura.sql",
    "049_finanzas_movimientos.sql",
    "050_finanzas_bancos_presupuesto.sql",
    "051_finanzas_ordenes_pago.sql",
    "052_documentos_estructura.sql",
    "053_documentos_relaciones_versiones.sql",
    "054_documentos_expedientes_plantillas.sql",
    "055_documentos_firmas.sql",
    "056_documentos_permisos.sql",
    "057_ia_estructura.sql",
    "058_ia_permisos.sql",
    "059_documentos_disponible_ia.sql",
    "060_ia_motor_local.sql",
    "061_ia_avatar_predefinido.sql",
    "062_finanzas_socios_protectores.sql",
    "063_finanzas_acuerdos_aportes.sql",
    "064_finanzas_beneficios_socios.sql",
    "065_finanzas_facturacion.sql",
    "066_finanzas_socios_permisos.sql",
    "067_ia_explicar_interpretacion.sql",
    "068_ia_eliminar_conversaciones.sql",
    "069_documentos_numeracion_avanzada.sql",
    "070_identidad_alineacion_titulo.sql"
)

if (!(Test-Path -LiteralPath $migrationsDir)) {
    throw "No existe el directorio de migraciones: $migrationsDir"
}

$presentes = Get-ChildItem -Path $migrationsDir -Filter "*.sql" |
    Where-Object { $_.Name -ne "000_create_database.sql" } |
    Select-Object -ExpandProperty Name
$noDeclaradas = @($presentes | Where-Object { $_ -notin $ordenMigraciones })
$faltantes = @($ordenMigraciones | Where-Object { $_ -notin $presentes })
if ($noDeclaradas.Count -gt 0 -or $faltantes.Count -gt 0) {
    throw "El manifiesto de migraciones no coincide con database/migrations. No declaradas: $($noDeclaradas -join ', '). Faltantes: $($faltantes -join ', ')."
}

$hashesPath = Join-Path $PSScriptRoot "migrations.sha256"
if (!(Test-Path -LiteralPath $hashesPath)) {
    throw "Falta el manifiesto de hashes $hashesPath"
}

$hashesEsperados = @{}
foreach ($linea in Get-Content -LiteralPath $hashesPath) {
    if ([string]::IsNullOrWhiteSpace($linea) -or $linea.TrimStart().StartsWith('#')) {
        continue
    }
    if ($linea -notmatch '^(?<hash>[A-Fa-f0-9]{64})\s{2,}(?<nombre>[^\\/:*?"<>|]+\.sql)$') {
        throw "Formato inválido en el manifiesto de hashes: $linea"
    }
    if ($hashesEsperados.ContainsKey($Matches.nombre)) {
        throw "Migración repetida en el manifiesto de hashes: $($Matches.nombre)"
    }
    $hashesEsperados[$Matches.nombre] = $Matches.hash.ToUpperInvariant()
}

$migracionesConHash = @("000_create_database.sql") + $ordenMigraciones
$hashesFaltantes = @($migracionesConHash | Where-Object { -not $hashesEsperados.ContainsKey($_) })
$hashesNoDeclarados = @($hashesEsperados.Keys | Where-Object { $_ -notin $migracionesConHash })
if ($hashesFaltantes.Count -gt 0 -or $hashesNoDeclarados.Count -gt 0) {
    throw "El manifiesto de hashes no coincide con las migraciones. Faltantes: $($hashesFaltantes -join ', '). No declaradas: $($hashesNoDeclarados -join ', ')."
}

foreach ($nombre in $migracionesConHash) {
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $migrationsDir $nombre)).Hash.ToUpperInvariant()
    if ($actual -ne $hashesEsperados[$nombre]) {
        throw "La migración $nombre fue modificada; su hash SHA-256 no coincide con el manifiesto."
    }
}

if ($ValidateOnly) {
    Write-Host "=== Manifiesto de migraciones válido; no se alteró la base de datos ===" -ForegroundColor Green
    return
}

# 000_create_database.sql crea literalmente sigbo_cbvc. Rechazar otro nombre
# evita crear una base y luego intentar migrar una distinta.
if ($Database -ne $databaseCanonica) {
    throw "Esta cadena de migraciones crea únicamente '$databaseCanonica'. No use -Database '$Database' hasta disponer de una migración parametrizada aprobada."
}

function Invoke-SigboSqlArchivo {
    param(
        [Parameter(Mandatory = $true)][string]$Base,
        [Parameter(Mandatory = $true)][string]$Ruta
    )
    & sqlcmd -S $Server -E -I -d $Base -b -i $Ruta
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo al ejecutar $Ruta contra $Base"
    }
}

function Invoke-SigboSqlConsulta {
    param(
        [Parameter(Mandatory = $true)][string]$Base,
        [Parameter(Mandatory = $true)][string]$Consulta
    )
    $salida = & sqlcmd -S $Server -E -I -d $Base -b -h -1 -W -Q $Consulta 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo en consulta SQL contra ${Base}: $($salida -join [Environment]::NewLine)"
    }
    return ($salida | Out-String).Trim()
}

# La creación es idempotente; ejecutarla contra master también confirma que la
# cadena actual sigue siendo compatible con la base canónica.
Invoke-SigboSqlArchivo -Base "master" -Ruta (Join-Path $migrationsDir "000_create_database.sql")

$inicializarHistorial = @'
SET NOCOUNT ON;
IF OBJECT_ID(N'dbo.__sigbo_migrations', N'U') IS NULL
BEGIN
    IF EXISTS (SELECT 1 FROM sys.tables WHERE is_ms_shipped = 0)
        THROW 51000, N'La base ya contiene tablas pero no tiene historial de migraciones SIGBO. No se reaplicará DDL histórico; cree una línea base institucional antes de actualizarla.', 1;

    CREATE TABLE dbo.__sigbo_migrations (
        nombre NVARCHAR(260) NOT NULL PRIMARY KEY,
        hash_sha256 CHAR(64) NOT NULL,
        aplicada_en DATETIME2(0) NOT NULL CONSTRAINT DF_sigbo_migrations_aplicada_en DEFAULT SYSUTCDATETIME()
    );
END;
'@
Invoke-SigboSqlConsulta -Base $Database -Consulta $inicializarHistorial | Out-Null

function VerificarORegistrarMigracion {
    param([Parameter(Mandatory = $true)][string]$Nombre)

    $nombreSql = $Nombre.Replace("'", "''")
    $hashEsperado = $hashesEsperados[$Nombre]
    $hashAplicado = Invoke-SigboSqlConsulta -Base $Database -Consulta "SET NOCOUNT ON; SELECT hash_sha256 FROM dbo.__sigbo_migrations WHERE nombre = N'$nombreSql';"
    if (![string]::IsNullOrWhiteSpace($hashAplicado)) {
        if ($hashAplicado.Trim().ToUpperInvariant() -ne $hashEsperado) {
            throw "La migración registrada $Nombre no coincide con el hash actual. No se continuará."
        }
        return $true
    }
    return $false
}

function RegistrarMigracion {
    param([Parameter(Mandatory = $true)][string]$Nombre)
    $nombreSql = $Nombre.Replace("'", "''")
    $hash = $hashesEsperados[$Nombre]
    Invoke-SigboSqlConsulta -Base $Database -Consulta "INSERT INTO dbo.__sigbo_migrations (nombre, hash_sha256) VALUES (N'$nombreSql', N'$hash');" | Out-Null
}

if (VerificarORegistrarMigracion -Nombre "000_create_database.sql") {
    Write-Host "-> 000_create_database.sql (ya aplicada)" -ForegroundColor DarkGray
} else {
    RegistrarMigracion -Nombre "000_create_database.sql"
}

foreach ($nombre in $ordenMigraciones) {
    if (VerificarORegistrarMigracion -Nombre $nombre) {
        Write-Host "-> $nombre (ya aplicada)" -ForegroundColor DarkGray
        continue
    }
    Write-Host "-> $nombre" -ForegroundColor Yellow
    Invoke-SigboSqlArchivo -Base $Database -Ruta (Join-Path $migrationsDir $nombre)
    RegistrarMigracion -Nombre $nombre
}

Write-Host "=== Migraciones completadas correctamente ===" -ForegroundColor Green
