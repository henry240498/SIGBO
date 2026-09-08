---
id: entity--historial-servicio
tipo: ENTITY
nombre: HistorialServicio
nivel: L1
dominio: servicios
resumen: "Linea de tiempo geografica/operativa de un servicio (Seguimiento Geografico y Operativo). Tabla original de 007_servicios.sql, sin entidad ni filas hasta la migracion 071 -- se reutiliza en vez de crear una tabla nueva. Cada fila con `tipoEvento: 'GPS'` es un punto de la \"ruta realizada\": hoy cargado manualmente desde la web, mas adelante por la app movil sin cambiar esta tabla."
tabla: servicios.historial_servicios
archivos:
  - backend/src/shared/entities/historial-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-historial-servicios]
terminos: [historial, servicio, servicios, tipo, evento, salida, cuartel, llegada, centro, salud, regreso, fin, punto, control, gps, incidente, observacion, otro]
---

# HistorialServicio

Linea de tiempo geografica/operativa de un servicio (Seguimiento Geografico y Operativo). Tabla original de 007_servicios.sql, sin entidad ni filas hasta la migracion 071 -- se reutiliza en vez de crear una tabla nueva. Cada fila con `tipoEvento: 'GPS'` es un punto de la "ruta realizada": hoy cargado manualmente desde la web, mas adelante por la app movil sin cambiar esta tabla.

- **Tabla:** [[table--servicios-historial-servicios|servicios.historial_servicios]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `TipoEventoHistorialServicio`: `SALIDA_CUARTEL` · `LLEGADA_SERVICIO` · `SALIDA_SERVICIO` · `LLEGADA_CENTRO_SALUD` · `SALIDA_CENTRO_SALUD` · `REGRESO_CUARTEL` · `FIN_SERVICIO` · `PUNTO_CONTROL` · `GPS` · `INCIDENTE` · `OBSERVACION` · `OTRO`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** SeguimientoGeograficoController
- **Servicios:** SeguimientoGeograficoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/historial-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-historial-servicios|servicios.historial_servicios]]

## Referenciado por

- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
