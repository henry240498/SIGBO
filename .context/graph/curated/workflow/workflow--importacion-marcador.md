---
id: workflow--importacion-marcador
tipo: WORKFLOW
nombre: Importacion de marcaciones desde el marcador digital
nivel: L2
resumen: Se analiza el archivo y se clasifica fila por fila (RECONOCIDO, NO_IDENTIFICADO, DUPLICADO, YA_IMPORTADO, INCONSISTENTE) antes de confirmar. Analizar no escribe asistencia.
dominio: asistencia
archivos: [backend/src/modules/operaciones/importaciones.service.ts, backend/src/modules/operaciones/importaciones.controller.ts]
terminos: [importacion, marcador, excel, marcacion, analizado, confirmado, cancelado, fila, duplicado]
edges:
  - [affects, entity--importacion-marcador]
  - [affects, entity--importacion-marcador-fila]
  - [affects, entity--marcacion-asistencia]
---

## Dos fases separadas a proposito

```
archivo ──► ANALIZADO ──► CONFIRMADO
                 └──────► CANCELADO
```

`EstadoImportacionMarcador` = `ANALIZADO` | `CONFIRMADO` | `CANCELADO`.

**Analizar no escribe marcaciones.** Crea una fila en
`operaciones.importaciones_marcador` y una fila por registro en
`operaciones.importaciones_marcador_filas`, cada una clasificada. El operador revisa y
recien entonces confirma.

## Clasificacion de cada fila

`EstadoFilaImportacion`:

| Estado | Significado |
|---|---|
| `RECONOCIDO` | Se identifico al bombero y la marcacion es nueva → se importara |
| `NO_IDENTIFICADO` | El codigo del marcador no corresponde a ningun bombero |
| `DUPLICADO` | Repetida dentro del mismo archivo |
| `YA_IMPORTADO` | Ya existe en `marcaciones_asistencia` de una importacion previa |
| `INCONSISTENTE` | Datos que no cierran (por ejemplo salida sin entrada) |

Solo `RECONOCIDO` se convierte en marcacion al confirmar. Los otros cuatro quedan como
constancia de lo que el archivo traia y por que no entro.

## Por que este diseno

Un marcador biometrico produce datos sucios: gente que no marco la salida, codigos de
personal dado de baja, archivos que se cargan dos veces. Importar directo contaminaria
el registro de asistencia, que es la base del calculo de porcentajes y por tanto de
decisiones sobre las personas.

`YA_IMPORTADO` es lo que hace **idempotente** reimportar el mismo archivo: no duplica.

## Detalle sobre los codigos

El marcador identifica por codigo de bombero. Si a alguien le cambiaron el numero,
`personal.historial_codigo` es lo que permite reconocerlo — ver
[[rule--cedula-y-numero-bombero-unicos]].

## Contexto

Requiere `asistencia:importar_marcador`. `FuenteAsistencia` distingue el origen de cada
marcacion: `MARCADOR_DIGITAL`, `MANUAL`, `IMPORTACION_EXCEL`, `EVENTO`, `GUARDIA`,
`OTRO` — asi una marcacion importada nunca se confunde con una cargada a mano. El
backend usa `exceljs` y `xlsx` para leer los archivos.
