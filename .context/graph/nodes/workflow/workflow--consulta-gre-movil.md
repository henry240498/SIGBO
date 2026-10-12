---
id: workflow--consulta-gre-movil
tipo: WORKFLOW
nombre: Consulta GRE documental y guiada en Android
nivel: L1
dominio: matpel
resumen: Con permiso matpel consultar, elegir material y capturar datos con certeza para consultar el motor compartido por API o localmente. Lector sin red y OCR transitorio sin registro de decisiones SCI.
archivos:
  - .movile/lib/matpel.dart
  - .movile/lib/matpel_consulta.dart
  - .movile/lib/matpel_parametros.dart
  - .movile/lib/mapa_matpel.dart
  - .movile/lib/matpel_documento.dart
  - .movile/lib/matpel_motor_local.dart
  - .movile/lib/matpel_foto.dart
  - .movile/android/app/src/main/kotlin/org/cbvc/sigbo/MotorGreLocal.kt
  - .movile/android/app/src/main/kotlin/org/cbvc/sigbo/OcrGreLocal.kt
  - .movile/test/matpel_consulta_test.dart
  - .movile/test/matpel_motor_local_test.dart
  - .movile/test/matpel_foto_test.dart
  - backend/src/modules/gre/matpel-motor-local.spec.ts
  - scripts/matpel/compilar_motor_local.cjs
  - scripts/matpel/motor_local_runtime.js
  - scripts/matpel/evaluacion_prueba_movil.cjs
  - .movile/docs/MATPEL.md
  - .movile/docs/GRE_CIERRE_20261012.md
edges:
  - [contains, rule--gre2024-fuente-conocimiento-operativo]
  - [depends_on, dependency--flutter]
  - [belongs_to, domain--matpel]
terminos: [gre, gre2024, matpel, movil, android, apk, consulta, guiada, zonas, aislamiento, proteccion, fuente, offline, documental, permiso, consultar, elegir, material, capturar, datos, certeza, motor, compartido, api, localmente, lector, red, ocr, transitorio, registro, decisiones, sci]
---

# Consulta GRE documental y guiada en Android

Con permiso matpel consultar, elegir material y capturar datos con certeza para consultar el motor compartido por API o localmente. Lector sin red y OCR transitorio sin registro de decisiones SCI.

Herramientas operativas → Consulta GRE · MATPEL → Consulta guiada en servidor.
Se comprueba el permiso y la edición activa. La selección documental comienza
sin identificación confirmada. Cantidad liberada, cantidad nominal por recipiente,
tipo/número de recipientes y viento permanecen separados. Los cambios de captura
invalidan resultados y respuestas pendientes. Un 401/403 borra la captura visible.
Las consultas no usan la cola ni almacenan datos del incidente en la biblioteca.

El lector local permite búsqueda, guía completa, secciones, las tres tablas verdes,
condiciones documentadas, fuentes y exportación del PDF verificado. Necesita descarga
previa; no selecciona ni activa un catálogo institucional. El mapa solo representa
la geometría recibida del motor, sin descargar teselas ni transmitir ubicaciones
a terceros. PDF297 / impresa295 conserva el alcance de la figura y sus notas.

Entrega2026-10-12: motor compartido compilado desde TypeScript dentro del APK,
ejecutado sin red en WebView aislado. OCR con Tesseract procesa placas localmente;
los candidatos no confirman identidad y no se adjuntan al Servicio. SCI, evidencia
operativa y aceptación permanecen pendientes.
Ver `.movile/docs/GRE_CIERRE_20261012.md` y la evidencia de integración técnica.


## Archivos

- `.movile/lib/matpel.dart`
- `.movile/lib/matpel_consulta.dart`
- `.movile/lib/matpel_parametros.dart`
- `.movile/lib/mapa_matpel.dart`
- `.movile/lib/matpel_documento.dart`
- `.movile/lib/matpel_motor_local.dart`
- `.movile/lib/matpel_foto.dart`
- `.movile/android/app/src/main/kotlin/org/cbvc/sigbo/MotorGreLocal.kt`
- `.movile/android/app/src/main/kotlin/org/cbvc/sigbo/OcrGreLocal.kt`
- `.movile/test/matpel_consulta_test.dart`
- `.movile/test/matpel_motor_local_test.dart`
- `.movile/test/matpel_foto_test.dart`
- `backend/src/modules/gre/matpel-motor-local.spec.ts`
- `scripts/matpel/compilar_motor_local.cjs`
- `scripts/matpel/motor_local_runtime.js`
- `scripts/matpel/evaluacion_prueba_movil.cjs`
- `.movile/docs/MATPEL.md`
- `.movile/docs/GRE_CIERRE_20261012.md`

## Relaciones

- `contains` → [[rule--gre2024-fuente-conocimiento-operativo|GRE2024 exige fuente original, condiciones, trazabilidad y prueba operativa]]
- `depends_on` → [[dependency--flutter|Flutter y el SDK de Android compilan la app móvil]]
- `belongs_to` → [[domain--matpel|MATPEL]]

---
<sub>Nodo **curado** (editable a mano).</sub>
