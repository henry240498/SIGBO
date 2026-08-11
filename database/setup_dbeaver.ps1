<#
================================================================================
 setup_dbeaver.ps1
 SIGBO-CBVC — Crear la conexion LOCAL en DBeaver automaticamente
================================================================================
 Escribe la conexion en el archivo de configuracion del workspace de DBeaver
 (data-sources.json). Hace copia de seguridad de todo lo que toca.

 IMPORTANTE: CERRAR DBEAVER ANTES DE EJECUTAR. DBeaver mantiene la
 configuracion en memoria y la reescribe al salir, pisando estos cambios.

 GUARDADO DE LA CONTRASENA
   DBeaver guarda las contrasenas cifradas en credentials-config.json. Este
   script solo intenta escribir ahi si consigue DESCIFRAR primero el archivo
   existente con la clave local de DBeaver Community — es decir, solo si
   verifica que entiende el formato de ESTA instalacion. Si no lo consigue,
   crea igual la conexion pero con "save-password" = false: DBeaver pedira
   la contrasena una sola vez, en la primera conexion, y ofrecera guardarla.
   Nunca se corrompe la configuracion existente.

 USO
   .\setup_dbeaver.ps1
   .\setup_dbeaver.ps1 -Database sigbo_cbvc -User sigbo_app -Password 'Sigbo.Local.2026'
   .\setup_dbeaver.ps1 -NoSavePassword        # no tocar credentials-config.json
================================================================================
#>

[CmdletBinding()]
param(
    [string] $Name     = 'SIGBO local (sigbo_cbvc)',
    [string] $DbHost   = 'localhost',
    [int]    $Port     = 1433,
    [string] $Database = 'sigbo_cbvc',
    [string] $User     = 'sigbo_app',
    [string] $Password = 'Sigbo.Local.2026',
    [string] $WorkspacePath,
    [switch] $NoSavePassword
)

$ErrorActionPreference = 'Stop'
function Ok    ($m) { Write-Host "   [OK]   $m" -ForegroundColor Green }
function Warn2 ($m) { Write-Host "   [WARN] $m" -ForegroundColor Yellow }
function Fail  ($m) { Write-Host "   [ERR]  $m" -ForegroundColor Red }
function Step  ($m) { Write-Host "`n>> $m" -ForegroundColor Cyan }

# --- guarda de localidad ------------------------------------------------------
if (@('localhost','127.0.0.1','::1',$env:COMPUTERNAME) -notcontains $DbHost) {
    Fail "ABORTADO: '$DbHost' no es local. Este script solo configura conexiones locales."
    exit 1
}

# ------------------------------------------------ 1. localizar el workspace
Step '1. Localizar el workspace de DBeaver'

if (-not $WorkspacePath) {
    $roots = @(
        (Join-Path $env:APPDATA 'DBeaverData'),
        (Join-Path $env:USERPROFILE '.local\share\DBeaverData')
    ) | Where-Object { Test-Path $_ }

    if (-not $roots) {
        Fail 'No se encuentra la carpeta de datos de DBeaver (DBeaverData).'
        Write-Host ''
        Write-Host '  QUE FALTA : DBeaver no fue ejecutado nunca en este usuario, o usa otra ruta.'
        Write-Host '  QUE HACER : abri DBeaver una vez (para que cree su workspace) y volve a ejecutar'
        Write-Host '              este script; o pasale la ruta a mano:'
        Write-Host '              .\setup_dbeaver.ps1 -WorkspacePath "C:\ruta\DBeaverData\workspace6"'
        Write-Host '  COMPROBAR : Test-Path "$env:APPDATA\DBeaverData"'
        exit 1
    }

    $ws = Get-ChildItem -Path $roots -Directory -Filter 'workspace*' -ErrorAction SilentlyContinue |
          Sort-Object Name -Descending | Select-Object -First 1
    if (-not $ws) { Fail "No hay ningun workspace* dentro de: $($roots -join ', ')"; exit 1 }
    $WorkspacePath = $ws.FullName
}
Ok "Workspace: $WorkspacePath"

# proyecto: 'General' por convencion; si no existe, el primero que tenga .dbeaver
$projDir = Join-Path $WorkspacePath 'General'
if (-not (Test-Path (Join-Path $projDir '.dbeaver'))) {
    $cand = Get-ChildItem $WorkspacePath -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path (Join-Path $_.FullName '.dbeaver') } |
            Select-Object -First 1
    if ($cand) { $projDir = $cand.FullName }
}
$cfgDir = Join-Path $projDir '.dbeaver'
if (-not (Test-Path $cfgDir)) { New-Item -ItemType Directory -Path $cfgDir -Force | Out-Null }
Ok "Proyecto: $projDir"

$dsFile   = Join-Path $cfgDir 'data-sources.json'
$credFile = Join-Path $cfgDir 'credentials-config.json'

# --- DBeaver corriendo?
if (Get-Process -Name 'dbeaver' -ErrorAction SilentlyContinue) {
    Warn2 'DBeaver esta ABIERTO. Cerralo y volve a ejecutar este script, o los cambios se perderan al salir.'
}

# ------------------------------------------------------- 2. leer / crear json
Step '2. Preparar data-sources.json'

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (Test-Path $dsFile) {
    Copy-Item $dsFile "$dsFile.bak-$stamp" -Force
    Ok "Backup: $(Split-Path $dsFile -Leaf).bak-$stamp"
    $ds = Get-Content $dsFile -Raw -Encoding UTF8 | ConvertFrom-Json
} else {
    $ds = [PSCustomObject]@{ folders = [PSCustomObject]@{}; connections = [PSCustomObject]@{} }
    Ok 'data-sources.json no existia: se crea uno nuevo.'
}
if (-not $ds.PSObject.Properties['connections']) {
    $ds | Add-Member -NotePropertyName connections -NotePropertyValue ([PSCustomObject]@{})
}

# id estable derivado del nombre de la base: re-ejecutar actualiza, no duplica
$connId = "sqlserver-sigbo-local-$($Database.ToLower())"
$jdbc   = "jdbc:sqlserver://${DbHost}:$Port;databaseName=$Database;encrypt=false;trustServerCertificate=true"

$conn = [PSCustomObject]@{
    provider        = 'sqlserver'
    driver          = 'mssql_jdbc_ms_new'
    name            = $Name
    'save-password' = (-not $NoSavePassword)
    'read-only'     = $false
    configuration   = [PSCustomObject]@{
        host                  = $DbHost
        port                  = "$Port"
        database              = $Database
        url                   = $jdbc
        configurationType     = 'MANUAL'
        type                  = 'dev'
        closeIdleConnection   = $true
        'auth-model'          = 'native'
        'provider-properties' = [PSCustomObject]@{
            '@dbeaver-show-non-default-db@' = 'true'
        }
    }
}

if ($ds.connections.PSObject.Properties[$connId]) {
    $ds.connections.PSObject.Properties.Remove($connId)
    Ok 'La conexion ya existia: se reemplaza.'
}
$ds.connections | Add-Member -NotePropertyName $connId -NotePropertyValue $conn -Force

$ds | ConvertTo-Json -Depth 12 | Set-Content -Path $dsFile -Encoding UTF8
Ok "Conexion '$Name' escrita en data-sources.json (id: $connId)"

# ---------------------------------------------- 3. contrasena (best effort)
Step '3. Guardar la contrasena (solo si el formato se puede verificar)'

$savedPassword = $false
if ($NoSavePassword) {
    Ok 'Omitido por -NoSavePassword.'
} else {
    # clave local publica de DBeaver Community
    $keyHex = 'babb4a9f774ab853c96c2d653dfe544a'
    $keyBytes = for ($i = 0; $i -lt $keyHex.Length; $i += 2) {
        [Convert]::ToByte($keyHex.Substring($i, 2), 16)
    }

    function New-Aes {
        $aes = [System.Security.Cryptography.Aes]::Create()
        $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
        $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
        $aes.Key = [byte[]]$keyBytes
        return $aes
    }

    function Decrypt-Cred([byte[]]$data) {
        if ($data.Length -le 16) { throw 'archivo demasiado corto' }
        $aes = New-Aes
        $aes.IV = [byte[]]($data[0..15])
        $dec = $aes.CreateDecryptor()
        $plain = $dec.TransformFinalBlock($data, 16, $data.Length - 16)
        $aes.Dispose()
        return [Text.Encoding]::UTF8.GetString($plain)
    }

    function Encrypt-Cred([string]$text) {
        $aes = New-Aes
        $aes.GenerateIV()
        $enc = $aes.CreateEncryptor()
        $bytes = [Text.Encoding]::UTF8.GetBytes($text)
        $ct = $enc.TransformFinalBlock($bytes, 0, $bytes.Length)
        $out = New-Object byte[] (16 + $ct.Length)
        [Array]::Copy($aes.IV, 0, $out, 0, 16)
        [Array]::Copy($ct, 0, $out, 16, $ct.Length)
        $aes.Dispose()
        return $out
    }

    $creds = $null
    if (Test-Path $credFile) {
        try {
            $raw  = [IO.File]::ReadAllBytes($credFile)
            $json = Decrypt-Cred $raw
            # el texto descifrado tiene relleno de espacios al final en algunas versiones
            $creds = $json.Trim([char[]]@([char]0, ' ', "`r", "`n")) | ConvertFrom-Json
            Ok 'credentials-config.json descifrado correctamente: el formato coincide.'
        } catch {
            Warn2 "No se pudo descifrar credentials-config.json ($($_.Exception.Message))."
        }
    } else {
        $creds = [PSCustomObject]@{}
        Ok 'credentials-config.json no existia: se creara.'
    }

    if ($null -ne $creds) {
        Copy-Item $credFile "$credFile.bak-$stamp" -Force -ErrorAction SilentlyContinue
        $entry = [PSCustomObject]@{ '#connection' = [PSCustomObject]@{ user = $User; password = $Password } }
        if ($creds.PSObject.Properties[$connId]) { $creds.PSObject.Properties.Remove($connId) }
        $creds | Add-Member -NotePropertyName $connId -NotePropertyValue $entry -Force

        $plain = $creds | ConvertTo-Json -Depth 8 -Compress
        $bytes = Encrypt-Cred $plain
        try {
            # verificacion de ida y vuelta antes de escribir
            $check = Decrypt-Cred $bytes | ConvertFrom-Json
            if ($check.PSObject.Properties[$connId]) {
                [IO.File]::WriteAllBytes($credFile, $bytes)
                $savedPassword = $true
                Ok "Contrasena guardada para el usuario '$User'."
            } else { Warn2 'Verificacion de cifrado fallida: no se escribio la contrasena.' }
        } catch {
            Warn2 "No se pudo escribir la contrasena: $($_.Exception.Message)"
        }
    }

    if (-not $savedPassword) {
        # dejar la conexion consistente: sin contrasena guardada
        $ds = Get-Content $dsFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $ds.connections.$connId.'save-password' = $false
        $ds | ConvertTo-Json -Depth 12 | Set-Content -Path $dsFile -Encoding UTF8
        Warn2 'La conexion queda sin contrasena guardada: DBeaver la pedira en la primera conexion.'
    }
}

# ------------------------------------------------------------- 4. resumen
Write-Host ''
Write-Host ('=' * 52)
Write-Host ' CONEXION DBEAVER'
Write-Host ('=' * 52)
Write-Host "Nombre    : $Name"
Write-Host "Driver    : Microsoft SQL Server (mssql_jdbc_ms_new)"
Write-Host "Host      : $DbHost"
Write-Host "Puerto    : $Port"
Write-Host "Database  : $Database"
Write-Host "Usuario   : $User"
Write-Host ("Password  : {0}" -f $(if ($savedPassword) { 'guardada en DBeaver' } else { "$Password  (se pedira al conectar)" }))
Write-Host "URL JDBC  : $jdbc"
Write-Host "Archivo   : $dsFile"
Write-Host ('=' * 52)
Write-Host ''
Write-Host 'Abri DBeaver: la conexion aparece en el arbol de la izquierda.'
Write-Host 'Si es la primera vez con SQL Server, DBeaver descargara el driver JDBC (necesita internet una sola vez).'
Write-Host ''
