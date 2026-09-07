---
id: entity--expediente
tipo: ENTITY
nombre: Expediente
nivel: L1
dominio: documentos
resumen: Agrupador de documentos ordenados cronologicamente (seccion 23 del pedido). El orden dentro del expediente vive en Documento.ordenEnExpediente, no aca.
tabla: documentos.expedientes
archivos:
  - backend/src/shared/entities/expediente.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-expedientes]
terminos: [expediente, expedientes, documentos, estado, abierto, cerrado]
---

# Expediente

Agrupador de documentos ordenados cronologicamente (seccion 23 del pedido). El orden dentro del expediente vive en Documento.ordenEnExpediente, no aca.

- **Tabla:** [[table--documentos-expedientes|documentos.expedientes]]
- **Columnas mapeadas:** 6

## Estados y enumeraciones

- `EstadoExpediente`: `ABIERTO` · `CERRADO`

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** ExpedientesController
- **Servicios:** ExpedientesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/expediente.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-expedientes|documentos.expedientes]]

## Referenciado por

- [[service--documentos-expedientes|ExpedientesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
