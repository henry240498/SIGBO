---
id: service--gre-gre-revision
tipo: SERVICE
nombre: GreRevisionService
nivel: L2
dominio: matpel
resumen: "Revisión humana dato ↔ fuente y validación de una versión candidata. Validar exige reporte sin hallazgos, celdas interpretadas y todas las referencias verificadas, incluidas notas, condiciones, índices, guías y reglas que cambian la selección."
capa: backend
archivos:
  - backend/src/modules/gre/gre-revision.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
  - [uses, service--seguridad-auditoria]
terminos: [gre, revision]
---

# GreRevisionService

Revisión humana dato ↔ fuente y validación de una versión candidata. Validar exige reporte sin hallazgos, celdas interpretadas y todas las referencias verificadas, incluidas notas, condiciones, índices, guías y reglas que cambian la selección.


## Metodos

`versiones()` · `version()` · `referencias()` · `progreso()` · `filasDePagina()` · `registrar()` · `validar()`

## Archivos

- `backend/src/modules/gre/gre-revision.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--gre-gre-admin|GreAdminController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
