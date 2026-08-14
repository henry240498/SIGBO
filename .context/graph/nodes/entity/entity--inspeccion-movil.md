---
id: entity--inspeccion-movil
tipo: ENTITY
nombre: InspeccionMovil
nivel: L1
dominio: asistencia
resumen: "Condicion de moviles dentro de una guardia (secciones 12/31/36-40 del pedido): un renglon por item del catalogo `vehiculos.checklist_items` verificado para un vehiculo especifico, en una guardia especifica. Mismo diseno plano que `InspeccionEstacion`."
tabla: operaciones.inspecciones_movil
archivos:
  - backend/src/shared/entities/inspeccion-movil.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-inspecciones-movil]
terminos: [inspeccion, movil, inspecciones, operaciones, estado]
---

# InspeccionMovil

Condicion de moviles dentro de una guardia (secciones 12/31/36-40 del pedido): un renglon por item del catalogo `vehiculos.checklist_items` verificado para un vehiculo especifico, en una guardia especifica. Mismo diseno plano que `InspeccionEstacion`.

- **Tabla:** [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]]
- **Columnas mapeadas:** 6

## Estados y enumeraciones

- `EstadoInspeccionMovil`: `OK` · `NO_OK`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BitacoraController, InspeccionesMovilController
- **Servicios:** BitacoraService, InspeccionesMovilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/inspeccion-movil.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
