<# Genera las carpetas android/ e ios/ con Flutter y aplica la personalizacion SIGBO.
Requiere: Flutter SDK instalado (https://docs.flutter.dev/get-started/install/windows).
Uso: .\.movile\scripts\bootstrap-flutter.ps1
No toca lib/, pubspec.yaml ni la logica: solo andamiaje nativo + overlay iOS.
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

$tmp = Join-Path ([IO.Path]::GetTempPath()) 'sigbo-flutter-base'
if (Test-Path -LiteralPath $tmp) { Remove-Item -Recurse -Force -LiteralPath $tmp }
flutter create --org org.cbvc.sigbo --project-name sigbo_alertas `
  --platforms android,ios --android-language kotlin --ios-language swift $tmp

# android/ generada (gradle wrapper incluido) + personalizacion SIGBO encima.
Copy-Item -Recurse -Force (Join-Path $tmp 'android\*') (Join-Path $movile 'android\')
Copy-Item -Force (Join-Path $movile 'android_app_src\AndroidManifest.xml') `
  (Join-Path $movile 'android\app\src\main\AndroidManifest.xml')
Copy-Item -Force (Join-Path $movile 'android_app_src\MainActivity.kt') `
  (Join-Path $movile 'android\app\src\main\kotlin\org\cbvc\sigbo\MainActivity.kt')
Copy-Item -Force (Join-Path $movile 'android_app_src\build.gradle') `
  (Join-Path $movile 'android\app\build.gradle')
New-Item -ItemType Directory -Force `
  -Path (Join-Path $movile 'android\app\src\main\res\values') | Out-Null
Copy-Item -Force (Join-Path $movile 'android_app_src\styles.xml') `
  (Join-Path $movile 'android\app\src\main\res\values\styles.xml')

# ios/ generada + overlay SIGBO (permisos, fondo, nombre).
New-Item -ItemType Directory -Force -Path (Join-Path $movile 'ios') | Out-Null
Copy-Item -Recurse -Force (Join-Path $tmp 'ios\*') (Join-Path $movile 'ios\')
Copy-Item -Force (Join-Path $movile 'ios_config\Info.plist') `
  (Join-Path $movile 'ios\Runner\Info.plist')
Copy-Item -Force (Join-Path $movile 'ios_config\AppDelegate.swift') `
  (Join-Path $movile 'ios\Runner\AppDelegate.swift')

Remove-Item -Recurse -Force -LiteralPath $tmp
Write-Output ''
Write-Output 'Listo. Ahora compile: .\.movile\scripts\compilar-apk.ps1'
