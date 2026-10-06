---
id: decision--apk-depuracion-firmado-con-clave-propia
tipo: DECISION
nombre: El APK distribuido es de depuración, vuelto a firmar con la clave del cuartel
nivel: L1
dominio: servicios
estado: VIGENTE
resumen: "Windows App Control bloquea gen_snapshot.exe y con él el build release; se compila en depuración y se firma con apksigner usando la clave propia, sin esquivar la política."
archivos:
  - .movile/scripts/publicar-apk.ps1
  - .movile/scripts/firmar-version.mjs
  - .movile/android/key.properties
edges:
  - [depends_on, dependency--flutter]
  - [belongs_to, domain--servicios]
terminos: [apk, release, debug, firma, keystore, apksigner, ed25519, actualizacion, sha256, distribuido, depuracion, vuelto, firmar, clave, cuartel, windows, control, bloquea, gen, snapshot, exe, build, compila, usando, propia, esquivar, politica]
---

# El APK distribuido es de depuración, vuelto a firmar con la clave del cuartel

Windows App Control bloquea gen_snapshot.exe y con él el build release; se compila en depuración y se firma con apksigner usando la clave propia, sin esquivar la política.

## Decisión

No se fuerza el build release: el bloqueo lo impone una política de seguridad de la PC y no
se la rodea. Se compila `--debug`, se firma con `~/.sigbo/sigbo-release.jks` y se publica
con `publicar-apk.ps1 -PermitirDebug`.

## Garantías que sí se mantienen

- La versión publicada (`version.json`) va firmada con **Ed25519**; la app solo acepta
  actualizaciones con esa firma.
- Se verifica SHA-256 y tamaño; el certificado del APK se **fija** en la primera
  publicación y las siguientes deben usar el mismo.

## Costo

- Pesa **~158 MB** y es más lento que un release.
- Muestra la cinta DEBUG y Google Play Protect lo trata como desconocido.
- Cuando se pueda compilar release, hay que republicar con el mismo certificado o las apps
  instaladas no se actualizarán.

Procedimiento: [[workflow--apk-compilar-firmar-publicar]].


## Archivos

- `.movile/scripts/publicar-apk.ps1`
- `.movile/scripts/firmar-version.mjs`
- `.movile/android/key.properties`

## Relaciones

- `depends_on` → [[dependency--flutter|Flutter y el SDK de Android compilan la app móvil]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[workflow--apk-compilar-firmar-publicar|Compilar, firmar, publicar e instalar el APK de SIGBO]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
