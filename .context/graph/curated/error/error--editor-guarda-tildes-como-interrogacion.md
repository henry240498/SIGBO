---
id: error--editor-guarda-tildes-como-interrogacion
tipo: ERROR
nombre: Una edición externa guardó las tildes y los separadores de la app como signos de interrogación
nivel: L1
resumen: main.dart y operacion.dart aparecieron con "Configuraci?n", "m?viles" y "admin ? fecha" tras una edición paralela; las letras se restauraron con vocabulario del APK y los separadores a mano.
severidad: MEDIA
archivos: [.movile/lib/main.dart, .movile/lib/operacion.dart, scripts/tildes-dart.py]
terminos: [tildes, interrogacion, codificacion, encoding, utf-8, editor, ansi, main.dart, operacion.dart, separador]
edges:
  - [originates_from, dependency--flutter]
  - [affects, rule--textos-de-la-app-con-tildes]
---

## Síntoma

El 2026-10-06, entre 09:47 y 09:50, `main.dart` y `operacion.dart` cambiaron de golpe (otro
rediseño del inicio, ajeno a la sesión que tenía el APK 1.5.3). En las cadenas, cada
carácter no ASCII pasó a `?`: `Contrase?a`, `Accesos r?pidos`, `Administraci?n`, `SIGBO ? CBVC`.
No había `U+FFFD` ni BOM: eran signos `?` literales, es decir, **pérdida irreversible**, no
un problema de visualización. La terminal de Git Bash además muestra mal la ñ y las vocales
acentuadas, así que un `grep` puede confundir ambas cosas; comprobar con Python.

## Causa probable

La herramienta o el editor que escribió esos archivos usó una codificación que no representa
las letras con tilde (ANSI/ASCII) al guardar. No se identificó cuál.

## Cómo se resolvió

1. `flutter analyze` sigue limpio: el daño es de contenido, no de sintaxis.
2. 32 textos restaurados con un vocabulario armado desde los archivos sanos y desde las
   cadenas del `kernel_blob.bin` del APK 1.5.3; los que terminan en `?` (registró, qué,
   envían) y los separadores `·` se arreglaron a mano.
3. Verificación: no quedan `[A-Za-z]?[a-z]` en cadenas, `tildes-dart.py --revisar` da 0.

## Volvió a pasar (2026-10-06, 11:xx)

`main.dart` quedó otra vez con `'Conectando?'` (era "Conectando…"), `'Carapegu?'`, `'Cargando aviso?'`, `'Solicit?'` y
`'Cargando?'`, y los separadores ` · ` como ` ? `. Para no depender de que alguien lo note a ojo hay un verificador:

```bash
python scripts/verificar-textos-dart.py   # sale con 1 si hay textos dañados; ignora ?., ?? y los ternarios
```

Correrlo antes de compilar el APK y después de cualquier edición masiva de `.movile/lib`.

## Cómo evitarlo

- Guardar siempre en **UTF-8 sin BOM**; en VS Code, ver la codificación en la barra de estado.
- Antes de compilar tras ediciones ajenas: `git diff --stat` y revisar cadenas con `?`.
- No dos sesiones editando `.movile/lib/main.dart` a la vez.
