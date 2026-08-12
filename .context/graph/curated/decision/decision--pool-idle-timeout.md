---
id: decision--pool-idle-timeout
tipo: DECISION
nombre: Pool de conexiones con idleTimeoutMillis bajo para reciclar conexiones colgadas
nivel: L2
resumen: El pool usa max 10, min 0 e idleTimeoutMillis 15000 para que una conexion atascada se descarte en vez de reutilizarse indefinidamente.
estado: VIGENTE
archivos: [backend/src/core/database/data-source-options.ts]
terminos: [pool, conexion, timeout, idle, colgada, mssql, reintento, 15s]
edges:
  - [configured_by, configuration--conexion-datos]
---

## Problema que resuelve

Una conexion del pool que queda colgada —por ejemplo tras un corte breve de red
con el SQLEXPRESS local— podia quedar atascada y ser **reutilizada
indefinidamente**, provocando timeouts de 15 s en cada request hasta reiniciar el
backend.

## Decision

```ts
requestTimeout: 15000,
pool: { max: 10, min: 0, idleTimeoutMillis: 15000 }
```

`min: 0` mas `idleTimeoutMillis: 15000` fuerzan a cerrar conexiones inactivas con
frecuencia, de modo que una conexion enferma se descarta en vez de heredarse al
siguiente request.

## Sintoma a reconocer

Si todos los endpoints empiezan a tardar exactamente ~15 s y despues fallan, no es
lentitud de consulta: es una conexion del pool atascada. Ver
[[error--pool-conexion-colgada]].

## Costo aceptado

Reciclar conexiones seguido implica reconectar mas seguido (handshake TCP + login).
En una instancia local es despreciable; contra un SQL Server remoto habria que
revisar el numero.
