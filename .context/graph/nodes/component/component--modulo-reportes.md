---
id: component--modulo-reportes
tipo: COMPONENT
nombre: reportes (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de reportes.
capa: backend
archivos:
  - backend/src/modules/reportes/reportes.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [reportes, modulo]
---

# reportes (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de reportes.


## Archivos

- `backend/src/modules/reportes/reportes.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--reportes-reportes|ReportesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
