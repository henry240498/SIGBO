---
id: domain--documentos
tipo: DOMAIN
nombre: Documentos
nivel: L0
dominio: documentos
estado: ACTIVO
resumen: "Modulo funcional \"Documentos\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [documentos]
---

# Documentos

Modulo funcional "Documentos". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--documento-relacion|DocumentoRelacion]] `belongs_to` →
- [[entity--documento|Documento]] `belongs_to` →
- [[entity--expediente|Expediente]] `belongs_to` →
- [[entity--firma-documento|FirmaDocumento]] `belongs_to` →
- [[entity--numeracion-documento|NumeracionDocumento]] `belongs_to` →
- [[entity--plantilla-documento|PlantillaDocumento]] `belongs_to` →
- [[entity--version-archivo-documento|VersionArchivoDocumento]] `belongs_to` →
- [[table--documentos-documentos|documentos.documentos]] `belongs_to` →
- [[table--documentos-numeraciones|documentos.numeraciones]] `belongs_to` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `belongs_to` →
- [[table--documentos-relaciones|documentos.relaciones]] `belongs_to` →
- [[table--documentos-versiones-archivo|documentos.versiones_archivo]] `belongs_to` →
- [[table--documentos-expedientes|documentos.expedientes]] `belongs_to` →
- [[table--documentos-plantillas|documentos.plantillas]] `belongs_to` →
- [[table--documentos-firmas-documento|documentos.firmas_documento]] `belongs_to` →
- [[component--modulo-documentos|documentos (modulo NestJS)]] `belongs_to` →
- [[service--documentos-consultas-documentos|ConsultasDocumentosService]] `belongs_to` →
- [[service--documentos-dashboard-documentos|DashboardDocumentosService]] `belongs_to` →
- [[service--documentos-documentos|DocumentosService]] `belongs_to` →
- [[service--documentos-expedientes|ExpedientesService]] `belongs_to` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `belongs_to` →
- [[service--documentos-plantillas|PlantillasService]] `belongs_to` →
- [[api--documentos-consultas-documentos|ConsultasDocumentosController]] `belongs_to` →
- [[api--documentos-dashboard-documentos|DashboardDocumentosController]] `belongs_to` →
- [[api--documentos-documentos|DocumentosController]] `belongs_to` →
- [[api--documentos-expedientes|ExpedientesController]] `belongs_to` →
- [[api--documentos-firmas-documento|FirmasDocumentoController]] `belongs_to` →
- [[api--documentos-plantillas|PlantillasController]] `belongs_to` →
- [[screen--dashboard-documentos-auditoria|/dashboard/documentos/auditoria]] `belongs_to` →
- [[screen--dashboard-documentos-expedientes|/dashboard/documentos/expedientes]] `belongs_to` →
- [[screen--dashboard-documentos-expedientes-id|/dashboard/documentos/expedientes/[id]]] `belongs_to` →
- [[screen--dashboard-documentos-listado|/dashboard/documentos/listado]] `belongs_to` →
- [[screen--dashboard-documentos|/dashboard/documentos]] `belongs_to` →
- [[screen--dashboard-documentos-plantillas|/dashboard/documentos/plantillas]] `belongs_to` →
- [[screen--dashboard-documentos-vencimientos|/dashboard/documentos/vencimientos]] `belongs_to` →
- [[screen--dashboard-documentos-id|/dashboard/documentos/[id]]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
