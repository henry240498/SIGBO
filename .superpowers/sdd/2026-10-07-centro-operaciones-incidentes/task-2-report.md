# Informe Task 2 — lógica pura del incidente

## Resultado

Se implementaron las funciones puras del núcleo de incidentes y sus pruebas enfocadas en `incidente-nucleo`. La política de horas acepta `MAS_CERCANA` (por defecto), `HORA_INICIADA` y `HORAS_COMPLETAS`; el resultado alternativo cierra desde cualquier fase abierta cuando no quedan despachos activos, según F10 y F13.

## TDD y validación

- RED: antes de crear `incidente.logica.ts`, `npx jest src/modules/incidente-nucleo/incidente.logica.spec.ts --runInBand` falló con `TS2307: Cannot find module './incidente.logica'` (1 suite fallida, 0 pruebas ejecutadas).
- GREEN: la misma orden pasó (1 suite, 30 pruebas).
- `npx tsc --noEmit` desde `backend`: pasó sin errores.
- `node .context/graph/build-graph.mjs`: regeneró el grafo; 1.050 nodos y 3.685 aristas.
- `node .context/graph/validar.mjs`: validó el grafo sin errores; reportó 8 avisos preexistentes de nodos sin relaciones y 36 tablas sin entidad.

## Archivos

- `backend/src/modules/incidente-nucleo/incidente.logica.ts`: fases, estados heredados, transiciones, resultados, condiciones, recursos, emergencia, etiquetas y cálculo de horas.
- `backend/src/modules/incidente-nucleo/incidente.logica.spec.ts`: 30 pruebas de las funciones anteriores, incluidas las tres políticas de horas y resultados alternativos con cero despachos desde las fases abiertas.

## Alcance y pendientes

No se ejecutó la suite backend completa porque el plan difiere ese gate a la tarea 20. El valor predeterminado `MAS_CERCANA` sigue siendo reemplazable por la lectura de `POLITICA_INCIDENTE/HORAS_SERVICIO` en los consumidores posteriores; esta tarea solo implementa la función pura parametrizada.
