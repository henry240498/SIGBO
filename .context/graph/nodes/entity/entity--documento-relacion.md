---
id: entity--documento-relacion
tipo: ENTITY
nombre: DocumentoRelacion
nivel: L1
dominio: documentos
resumen: "Relacion polimorfica documento <-> cualquier entidad de SIGBO (secciones 14-15, 48 del pedido). Mismo patron ya validado en produccion por seguridad.log_auditoria (`recurso`/`recursoId`): sin FK tipada por modulo, `modulo`+`entidad`+`registroId` identifican el registro relacionado. Un documento puede tener muchas filas (una resolucion puede involucrar a 5 bomberos + la institucion + un cargo). `etiqueta` es una copia legible congelada al momento de crear la relacion (ej. \"BC-102\"), para listar sin tener que resolver el nombre actual de cada entidad relacionada en cada consulta."
tabla: documentos.relaciones
archivos:
  - backend/src/shared/entities/documento-relacion.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-relaciones]
terminos: [documento, relacion, relaciones, documentos]
---

# DocumentoRelacion

Relacion polimorfica documento <-> cualquier entidad de SIGBO (secciones 14-15, 48 del pedido). Mismo patron ya validado en produccion por seguridad.log_auditoria (`recurso`/`recursoId`): sin FK tipada por modulo, `modulo`+`entidad`+`registroId` identifican el registro relacionado. Un documento puede tener muchas filas (una resolucion puede involucrar a 5 bomberos + la institucion + un cargo). `etiqueta` es una copia legible congelada al momento de crear la relacion (ej. "BC-102"), para listar sin tener que resolver el nombre actual de cada entidad relacionada en cada consulta.

- **Tabla:** [[table--documentos-relaciones|documentos.relaciones]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** DocumentosController, PlantillasController
- **Servicios:** DocumentosService, PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/documento-relacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-relaciones|documentos.relaciones]]

## Referenciado por

- [[service--documentos-documentos|DocumentosService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
