---
id: error--smart-app-control-bloquea-flutter
tipo: ERROR
nombre: Smart App Control / Windows App Control bloquea ejecutables de Flutter
nivel: L1
resumen: "flutter falla con \"Una directiva de Control de aplicaciones bloqueó este archivo\" (dartvm.exe, gen_snapshot.exe); a veces cede con el tiempo y no se debe esquivar."
severidad: ALTA
archivos:
  - .movile/scripts/compilar-apk.ps1
edges:
  - [originates_from, dependency--flutter]
terminos: [smart app control, app control, dartvm, gen_snapshot, flutter, bloqueo, release, code integrity, smart, control, windows, bloquea, ejecutables, falla, directiva, aplicaciones, este, archivo, exe, gen, snapshot, veces, cede, tiempo, debe, esquivar]
---

# Smart App Control / Windows App Control bloquea ejecutables de Flutter

flutter falla con "Una directiva de Control de aplicaciones bloqueó este archivo" (dartvm.exe, gen_snapshot.exe); a veces cede con el tiempo y no se debe esquivar.

## Síntoma

`flutter --version` o `flutter build` terminan con
`ProcessStarter::StartForExec failed: Una directiva de Control de aplicaciones bloqueó este
archivo`. Funcionaba minutos antes.

## Causa

La política de la PC (Smart App Control, basado en reputación) rechaza el binario no
firmado. Se confirma en el visor de eventos: registro
`Microsoft-Windows-CodeIntegrity/Operational` → "attempted to load ...dartvm.exe that did
not meet the Enterprise signing level requirements". El build **release** quedó bloqueado
de forma permanente por `gen_snapshot.exe`; ver
[[decision--apk-depuracion-firmado-con-clave-propia]].

## Qué hacer

1. Reintentar más tarde: el veredicto cambió solo (el 2026-10-06 volvió a funcionar).
2. Permitir el archivo desde Seguridad de Windows, o compilar en otra PC.
3. Apagar Smart App Control es decisión de la persona dueña de la PC (suele no poder
   revertirse). **No se esquiva la política ni se apaga por cuenta propia.**

La extensión Dart/Flutter de VS Code usa el mismo SDK (`dart.flutterSdkPath`), así que no
evita el bloqueo.


## Archivos

- `.movile/scripts/compilar-apk.ps1`

## Relaciones

- `originates_from` → [[dependency--flutter|Flutter y el SDK de Android compilan la app móvil]]

---
<sub>Nodo **curado** (editable a mano).</sub>
