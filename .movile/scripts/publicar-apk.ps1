<#
    Publica un APK para que las apps instaladas se actualicen solas, de forma
    verificable:

      1. Comprueba la firma del APK con apksigner (Android SDK) y rechaza un APK
         de depuracion (salvo -PermitirDebug, solo para pruebas).
      2. Fija la huella del certificado: la primera publicacion la guarda; las
         siguientes deben usar el MISMO certificado (Android no actualiza una
         app firmada con otra clave).
      3. Firma digitalmente (Ed25519) la version, el hash y el tamano con la
         clave privada del cuartel (fuera del repo: ~\.sigbo). La app solo
         acepta actualizaciones con esa firma.
      4. Copia el APK a backend\storage\app-movil, escribe version.json y vuelve
         a verificar lo publicado.

    Uso:
      .\.movile\scripts\publicar-apk.ps1 [-Apk ruta.apk] [-Notas "que cambio"] [-Obligatoria]
    Primera vez:  node .movile\scripts\firmar-version.mjs generar-clave
                  (y recompilar la app, que lleva embebida la clave publica)
#>
param(
    [string]$Apk,
    [string]$Notas = '',
    [switch]$Obligatoria,
    [switch]$PermitirDebug,
    [switch]$AceptarNuevoCertificado,
    [string]$Destino
)

$ErrorActionPreference = 'Stop'
$movile = Split-Path -Parent $PSScriptRoot
$raiz = Split-Path -Parent $movile
$destino = if ($Destino) { $Destino } else { Join-Path $raiz 'backend\storage\app-movil' }
$firmador = Join-Path $PSScriptRoot 'firmar-version.mjs'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Se necesita Node.js (ya lo usa el backend).' }

if (-not $Apk) {
    foreach ($c in @('build\app\outputs\flutter-apk\app-release.apk', 'build\app\outputs\flutter-apk\app-debug.apk')) {
        $ruta = Join-Path $movile $c
        if (Test-Path -LiteralPath $ruta) { $Apk = $ruta; break }
    }
}
if (-not $Apk -or -not (Test-Path -LiteralPath $Apk)) {
    throw 'No se encontro el APK. Compilelo primero (compilar-apk.ps1) o indique -Apk.'
}
$Apk = (Resolve-Path -LiteralPath $Apk).Path

# --- version desde pubspec.yaml ---
$linea = Select-String -Path (Join-Path $movile 'pubspec.yaml') -Pattern '^version:\s*(\d+\.\d+\.\d+)\+(\d+)\s*$' | Select-Object -First 1
if (-not $linea) { throw 'pubspec.yaml debe tener "version: X.Y.Z+N".' }
$nombre = $linea.Matches[0].Groups[1].Value
$codigo = [int]$linea.Matches[0].Groups[2].Value

# --- 1) firma del APK con apksigner ---
function Buscar-ApkSigner {
    $sdk = $env:ANDROID_HOME
    if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
    $props = Join-Path $movile 'android\local.properties'
    if (-not $sdk -and (Test-Path -LiteralPath $props)) {
        $l = Select-String -Path $props -Pattern '^sdk\.dir=(.*)$' | Select-Object -First 1
        if ($l) { $sdk = $l.Matches[0].Groups[1].Value -replace '\\\\', '\' -replace '\\:', ':' }
    }
    if (-not $sdk) { return $null }
    Get-ChildItem -Path (Join-Path $sdk 'build-tools') -Filter 'apksigner.bat' -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName | Select-Object -Last 1 -ExpandProperty FullName
}
$apksigner = Buscar-ApkSigner
if (-not $apksigner) { throw 'No se encontro apksigner (Android SDK build-tools). Defina ANDROID_HOME.' }

$salida = & $apksigner verify --print-certs $Apk 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { throw "apksigner rechazo el APK:`n$salida" }
$huella = ([regex]::Match($salida, 'certificate SHA-256 digest:\s*([0-9a-fA-F]{64})')).Groups[1].Value.ToLower()
if (-not $huella) { throw 'No se pudo leer la huella del certificado del APK.' }
if ($salida -match 'CN=Android Debug' -and -not $PermitirDebug) {
    throw 'El APK esta firmado con la clave de DEPURACION (distinta en cada PC): las apps instaladas no podran actualizarse con el. Compile un release firmado (android\key.properties) o use -PermitirDebug solo para pruebas.'
}

# --- 2) huella del certificado fijada ---
New-Item -ItemType Directory -Force -Path $destino | Out-Null
$archivoHuella = Join-Path $destino 'certificado.sha256'
if (Test-Path -LiteralPath $archivoHuella) {
    $fijada = (Get-Content -Raw -LiteralPath $archivoHuella).Trim()
    if ($fijada -ne $huella -and -not $AceptarNuevoCertificado) {
        throw "El certificado de este APK ($huella) no es el de las versiones ya publicadas ($fijada). Android no lo instalaria como actualizacion. Use -AceptarNuevoCertificado solo si es un cambio deliberado (obligara a reinstalar la app a mano)."
    }
}

# --- no retroceder ---
$meta = Join-Path $destino 'version.json'
if (Test-Path -LiteralPath $meta) {
    $anterior = [int](Get-Content -Raw -LiteralPath $meta | ConvertFrom-Json).versionCodigo
    if ($codigo -le $anterior) {
        throw "El codigo de version ($codigo) debe ser mayor que el ya publicado ($anterior). Suba el numero tras el + en pubspec.yaml y recompile."
    }
}

# --- 3 y 4) firma digital, publicacion y reverificacion ---
$args = @($firmador, 'publicar', '--apk', $Apk, '--codigo', $codigo, '--nombre', $nombre, '--destino', $destino, '--notas', $Notas)
if ($Obligatoria) { $args += '--obligatoria' }
& node @args
if ($LASTEXITCODE -ne 0) { throw 'No se pudo firmar y publicar la version.' }
& node $firmador verificar --destino $destino
if ($LASTEXITCODE -ne 0) { throw 'La verificacion posterior fallo.' }

[System.IO.File]::WriteAllText($archivoHuella, $huella, [System.Text.UTF8Encoding]::new($false))

$tam = [math]::Round((Get-Item (Join-Path $destino 'sigbo-alertas.apk')).Length / 1MB, 1)
Write-Host "Publicada la version $nombre (codigo $codigo, $tam MB). Certificado ${huella}" -ForegroundColor Green
Write-Host "Las apps instaladas la ofreceran al abrirse. Obligatoria: $([bool]$Obligatoria)"
