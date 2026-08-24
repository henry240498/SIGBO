---
id: entity--documento
tipo: ENTITY
nombre: Documento
nivel: L1
dominio: documentos
resumen: "Ficha central de un documento institucional (seccion 6 del pedido). `estadoId`/`tipoDocumentoId`/`categoriaDocumentoId`/`nivelConfidencialidadId` referencian organizacion.parametros -- parametrizables per seccion 3-4-11-32, pero las transiciones de estado se validan en codigo por nombre (ver DocumentosService), no cualquier valor vale desde cualquier otro. `archivoUrl` es SIEMPRE el archivo vigente; el historico de versiones anteriores vive en documentos.versiones_archivo (nunca se sobrescribe silenciosamente -- seccion 12)."
tabla: documentos.documentos_institucionales
archivos:
  - backend/src/shared/entities/documento.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-documentos-institucionales]
terminos: [documento, documentos, institucionales, origen, interno, externo]
---

# Documento

Ficha central de un documento institucional (seccion 6 del pedido). `estadoId`/`tipoDocumentoId`/`categoriaDocumentoId`/`nivelConfidencialidadId` referencian organizacion.parametros -- parametrizables per seccion 3-4-11-32, pero las transiciones de estado se validan en codigo por nombre (ver DocumentosService), no cualquier valor vale desde cualquier otro. `archivoUrl` es SIEMPRE el archivo vigente; el historico de versiones anteriores vive en documentos.versiones_archivo (nunca se sobrescribe silenciosamente -- seccion 12).

- **Tabla:** [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- **Columnas mapeadas:** 32

## Estados y enumeraciones

- `OrigenDocumento`: `INTERNO` · `EXTERNO`

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** ConsultasDocumentosController, DashboardDocumentosController, DocumentosController, ExpedientesController, PlantillasController
- **Servicios:** ConsultasDocumentosService, DashboardDocumentosService, DocumentosService, ExpedientesService, PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/documento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]

## Referenciado por

- [[service--documentos-consultas-documentos|ConsultasDocumentosService]] `uses` →
- [[service--documentos-dashboard-documentos|DashboardDocumentosService]] `uses` →
- [[service--documentos-documentos|DocumentosService]] `uses` →
- [[service--documentos-expedientes|ExpedientesService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
