---
id: error--pool-conexion-colgada
tipo: ERROR
nombre: Timeouts de exactamente 15 segundos en todos los endpoints
nivel: L2
resumen: Una conexion del pool queda atascada tras un corte breve de red y se reutiliza indefinidamente. Todos los requests tardan ~15s y fallan hasta reiniciar el backend.
severidad: ALTA
archivos: [backend/src/core/database/data-source-options.ts]
terminos: [timeout, 15, pool, conexion, colgada, atascada, lento, requesttimeout, reiniciar]
edges:
  - [originates_from, configuration--conexion-datos]
  - [originates_from, dependency--sqlserver-express]
---

## Sintoma que lo identifica

**Todos** los endpoints tardan ~15 segundos y despues fallan. El numero es siempre el
mismo — 15 s es exactamente `requestTimeout`/`connectTimeout`.

Si el tiempo fuera variable seria lentitud de consulta. Que sea constante y uniforme
delata el timeout, no la carga.

## Causa

Una conexion del pool queda colgada (tipicamente tras un corte breve de red con el
SQLEXPRESS local) y **se reutiliza indefinidamente** en vez de descartarse. Cada
request que la toma del pool espera 15 s y muere.

## Mitigacion ya aplicada

```ts
pool: { max: 10, min: 0, idleTimeoutMillis: 15000 }
```

`min: 0` mas `idleTimeoutMillis` bajo fuerzan a cerrar conexiones inactivas seguido, de
modo que una conexion enferma se descarte antes de heredarse. Ver
[[decision--pool-idle-timeout]].

## Si vuelve a pasar

1. Reiniciar el backend — libera el pool entero y confirma el diagnostico.
2. Verificar que la instancia responde: `Test-NetConnection localhost -Port 1433`.
3. Solo si se repite seguido, bajar mas `idleTimeoutMillis` o agregar validacion de
   conexion al tomarla del pool.

**No** subir `requestTimeout` — eso alarga la espera sin arreglar nada.

## Pista para no confundirlo

Si el backend fue **recien reiniciado** y falla igual, no es esto: revisar
[[error--tcp-sqlexpress-deshabilitado]]. Si el codigo que corre no parece ser el que
editaste, revisar [[error--start-script-no-reinicia-servicios]].
