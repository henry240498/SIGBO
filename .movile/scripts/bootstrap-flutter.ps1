<# Recupera el wrapper Android y genera ios/ con Flutter.
Requiere: Flutter SDK instalado (https://docs.flutter.dev/get-started/install/windows).
Uso: .\.movile\scripts\bootstrap-flutter.ps1
Conserva el proyecto Android versionado, incluido el motor GRE y el OCR local.
#>
$ErrorActionPreference = 'Stop'
$movile = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $movile

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
  Write-Output 'ERROR: Flutter no esta instalado. Instale Flutter SDK y reintente.'
  exit 1
}
flutter --version
flutter pub get

$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$tmp = Join-Path $tempRoot ('sigbo-flutter-base-' + [guid]::NewGuid().ToString('N'))
flutter create --org org.cbvc.sigbo --project-name sigbo_alertas `
  --platforms android,ios --android-language kotlin --ios-language swift --no-pub $tmp
if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el wrapper de Flutter.' }

# Solo recuperar archivos ignorados; no reemplazar fuentes ni configuracion.
foreach ($wrapperFile in @('gradlew', 'gradlew.bat', 'gradle\wrapper\gradle-wrapper.jar')) {
  Copy-Item -LiteralPath (Join-Path $tmp ('android\' + $wrapperFile)) `
    -Destination (Join-Path $movile ('android\' + $wrapperFile)) -Force
}

# ios/ generada + overlay SIGBO (permisos, fondo, nombre).
New-Item -ItemType Directory -Force -Path (Join-Path $movile 'ios') | Out-Null
Copy-Item -Recurse -Force (Join-Path $tmp 'ios\*') (Join-Path $movile 'ios\')
Copy-Item -Force (Join-Path $movile 'ios_config\Info.plist') `
  (Join-Path $movile 'ios\Runner\Info.plist')
Copy-Item -Force (Join-Path $movile 'ios_config\AppDelegate.swift') `
  (Join-Path $movile 'ios\Runner\AppDelegate.swift')

$resolvedTemp = [IO.Path]::GetFullPath($tmp)
if (-not $resolvedTemp.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -or
    (Split-Path -Leaf $resolvedTemp) -notmatch '^sigbo-flutter-base-[a-f0-9]{32}$') {
  throw 'Ruta temporal inesperada; no se eliminara.'
}
Remove-Item -Recurse -Force -LiteralPath $resolvedTemp
Write-Output ''
Write-Output 'Listo. Ahora compile: .\.movile\scripts\compilar-apk.ps1'
