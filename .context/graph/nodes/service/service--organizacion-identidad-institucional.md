---
id: service--organizacion-identidad-institucional
tipo: SERVICE
nombre: IdentidadInstitucionalService
nivel: L2
dominio: organizacion
resumen: "Identidad documental institucional (fila unica, patron AparienciaService): membrete, datos de contacto y logos reutilizables por cualquier modulo que genere documentos PDF/DOCX."
capa: backend
archivos:
  - backend/src/modules/organizacion/identidad-institucional.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--identidad-institucional]
  - [reads, table--organizacion-identidad-institucional]
terminos: [identidad, institucional, organizacion]
---

# IdentidadInstitucionalService

Identidad documental institucional (fila unica, patron AparienciaService): membrete, datos de contacto y logos reutilizables por cualquier modulo que genere documentos PDF/DOCX.


## Metodos

`obtener()` · `actualizar()` · `actualizarLogo()`

## Archivos

- `backend/src/modules/organizacion/identidad-institucional.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--identidad-institucional|IdentidadInstitucional]]
- `reads` → [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]

## Referenciado por

- [[api--organizacion-identidad-institucional|IdentidadInstitucionalController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
