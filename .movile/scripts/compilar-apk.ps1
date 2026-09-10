<# Compila el APK de depuracion para pruebas locales.
Requiere (una sola vez): Flutter SDK + Android SDK, y haber corrido bootstrap-flutter.ps1.
Uso: .\.movile\scripts\compilar-apk.ps1
Salida: build\app\outputs\flutter-apk\app-debug.apk
Para URL fija de fabrica: $env:SIGBO_API_URL="http://IP:3001/api/v1" antes de compilar
(aunque siempre puede cambiarse en la app en Ajustes > Servidor).
#>
$ErrorActionPreference = 'Stop'
$movile = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $movile

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
  Write-Output 'ERROR: Flutter no esta instalado (https://docs.flutter.dev/get-started/install/windows).'
  exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $movile 'android\gradlew.bat'))) {
  Write-Output 'Falta el andamiaje android/. Ejecute primero: .\.movile\scripts\bootstrap-flutter.ps1'
  exit 1
}
flutter pub get
$define = @()
if ($env:SIGBO_API_URL) { $define += "--dart-define=SIGBO_API_URL=$env:SIGBO_API_URL" }
flutter analyze
flutter build apk --debug @define
Write-Output ''
Write-Output 'APK: build\app\outputs\flutter-apk\app-debug.apk'
