---
id: entity--inspeccion-estacion
tipo: ENTITY
nombre: InspeccionEstacion
nivel: L1
dominio: asistencia
resumen: "Checklist de condicion de la estacion por guardia (seccion 10). `sector` referencia organizacion.parametros (tipo SECTOR_ESTACION)."
tabla: operaciones.inspecciones_estacion
archivos:
  - backend/src/shared/entities/inspeccion-estacion.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-inspecciones-estacion]
terminos: [inspeccion, estacion, inspecciones, operaciones, estado]
---

# InspeccionEstacion

Checklist de condicion de la estacion por guardia (seccion 10). `sector` referencia organizacion.parametros (tipo SECTOR_ESTACION).

- **Tabla:** [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]]
- **Columnas mapeadas:** 5

## Estados y enumeraciones

- `EstadoInspeccionEstacion`: `OK` · `NO_OK`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BitacoraController, InspeccionesEstacionController
- **Servicios:** BitacoraService, InspeccionesEstacionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/inspeccion-estacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
