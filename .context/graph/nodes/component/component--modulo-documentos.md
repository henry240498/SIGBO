---
id: component--modulo-documentos
tipo: COMPONENT
nombre: documentos (modulo NestJS)
nivel: L1
dominio: documentos
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de documentos.
capa: backend
archivos:
  - backend/src/modules/documentos/documentos.module.ts
edges:
  - [belongs_to, domain--documentos]
terminos: [documentos, modulo]
---

# documentos (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de documentos.


## Entidades registradas (forFeature)

Documento, DocumentoRelacion, VersionArchivoDocumento, Expediente, PlantillaDocumento, FirmaDocumento, NumeracionDocumento, // Entidades de otros modulos que Documentos consulta/referencia
      // directamente (mismo patron de bajo acoplamiento ya usado en
      // Deposito/Academia/Finanzas): nunca se duplican sus estructuras.
      Parametro, Bombero, Cargo, Designacion, Rango, IdentidadInstitucional

## Archivos

- `backend/src/modules/documentos/documentos.module.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]

## Referenciado por

- [[service--documentos-consultas-documentos|ConsultasDocumentosService]] `uses` →
- [[service--documentos-dashboard-documentos|DashboardDocumentosService]] `uses` →
- [[service--documentos-documentos|DocumentosService]] `uses` →
- [[service--documentos-expedientes|ExpedientesService]] `uses` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
