---
id: entity--plantilla-documento
tipo: ENTITY
nombre: PlantillaDocumento
nivel: L1
dominio: documentos
resumen: "Plantilla documental con placeholders {{CAMPO}} (seccion 40). El firmante por defecto se define por Cargo, nunca por el nombre de una persona fija (seccion 41) -- se resuelve en el momento de generar cada documento via resolverFirmante(), asi que si cambia quien ocupa el cargo, los documentos NUEVOS usan al nuevo responsable pero los ya generados no cambian retroactivamente (quedan con el snapshot que ya se le trabajo en su DocumentoFirma)."
tabla: documentos.plantillas
archivos:
  - backend/src/shared/entities/plantilla-documento.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-plantillas]
terminos: [plantilla, documento, plantillas, documentos]
---

# PlantillaDocumento

Plantilla documental con placeholders {{CAMPO}} (seccion 40). El firmante por defecto se define por Cargo, nunca por el nombre de una persona fija (seccion 41) -- se resuelve en el momento de generar cada documento via resolverFirmante(), asi que si cambia quien ocupa el cargo, los documentos NUEVOS usan al nuevo responsable pero los ya generados no cambian retroactivamente (quedan con el snapshot que ya se le trabajo en su DocumentoFirma).

- **Tabla:** [[table--documentos-plantillas|documentos.plantillas]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** PlantillasController
- **Servicios:** PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/plantilla-documento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-plantillas|documentos.plantillas]]

## Referenciado por

- [[service--documentos-plantillas|PlantillasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
