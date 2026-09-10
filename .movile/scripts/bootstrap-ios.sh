#!/bin/sh
# Compilacion iOS (SOLO en Mac con Xcode): genera ios/ y aplica el overlay SIGBO.
# Uso (en Mac, desde la carpeta .movile):
#   sh scripts/bootstrap-ios.sh
#   flutter build ipa --export-method ad-hoc
# Nota: el .ipa requiere firma Apple (cuenta developer / ad-hoc). Sin cuenta,
# puede probarse en simulador con: flutter run
set -e
cd "$(dirname "$0")/.."
flutter pub get
TMPDIR_BASE="${TMPDIR:-/tmp}/sigbo-flutter-base"
rm -rf "$TMPDIR_BASE"
flutter create --org org.cbvc.sigbo --project-name sigbo_alertas \
  --platforms ios --ios-language swift "$TMPDIR_BASE"
mkdir -p ios
cp -R "$TMPDIR_BASE/ios/" ios/
cp ios_config/Info.plist ios/Runner/Info.plist
cp ios_config/AppDelegate.swift ios/Runner/AppDelegate.swift
rm -rf "$TMPDIR_BASE"
echo 'Listo. En Mac: flutter build ipa --export-method ad-hoc'
