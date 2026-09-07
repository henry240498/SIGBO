---
id: service--documentos-plantillas
tipo: SERVICE
nombre: PlantillasService
nivel: L2
dominio: documentos
resumen: "Plantillas documentales con placeholders {{CAMPO}} (seccion 40). El firmante se resuelve por Cargo (nunca un nombre fijo -- seccion 41), reutilizando resolverFirmante() tal cual lo usan Academia/Guardias."
capa: backend
archivos:
  - backend/src/modules/documentos/plantillas.service.ts
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--modulo-documentos]
  - [uses, entity--plantilla-documento]
  - [reads, table--documentos-plantillas]
  - [uses, entity--documento]
  - [reads, table--documentos-documentos-institucionales]
  - [uses, entity--documento-relacion]
  - [reads, table--documentos-relaciones]
  - [uses, entity--firma-documento]
  - [reads, table--documentos-firmas-documento]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--identidad-institucional]
  - [reads, table--organizacion-identidad-institucional]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, service--documentos-documentos]
  - [uses, service--seguridad-auditoria]
terminos: [plantillas, documentos, plantilla, documento, relacion, firma, parametro, identidad, institucional, cargo, designacion, bombero, rango]
---

# PlantillasService

Plantillas documentales con placeholders {{CAMPO}} (seccion 40). El firmante se resuelve por Cargo (nunca un nombre fijo -- seccion 41), reutilizando resolverFirmante() tal cual lo usan Academia/Guardias.


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `generar()`

## Archivos

- `backend/src/modules/documentos/plantillas.service.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--modulo-documentos|documentos (modulo NestJS)]]
- `uses` → [[entity--plantilla-documento|PlantillaDocumento]]
- `reads` → [[table--documentos-plantillas|documentos.plantillas]]
- `uses` → [[entity--documento|Documento]]
- `reads` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `uses` → [[entity--documento-relacion|DocumentoRelacion]]
- `reads` → [[table--documentos-relaciones|documentos.relaciones]]
- `uses` → [[entity--firma-documento|FirmaDocumento]]
- `reads` → [[table--documentos-firmas-documento|documentos.firmas_documento]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--identidad-institucional|IdentidadInstitucional]]
- `reads` → [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[service--documentos-documentos|DocumentosService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--documentos-plantillas|PlantillasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
