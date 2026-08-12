---
id: service--guardias-requisitos-rol
tipo: SERVICE
nombre: RequisitosRolService
nivel: L2
dominio: guardias
resumen: Logica de negocio de requisitos rol (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/requisitos-rol.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--requisito-rol-guardia]
  - [reads, table--operaciones-requisitos-rol-guardia]
  - [uses, service--seguridad-auditoria]
terminos: [requisitos, rol, guardias, requisito, guardia]
---

# RequisitosRolService

Logica de negocio de requisitos rol (modulo guardias).


## Metodos

`findAll()` · `create()` · `toggleActivo()` · `remove()`

## Archivos

- `backend/src/modules/guardias/requisitos-rol.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--requisito-rol-guardia|RequisitoRolGuardia]]
- `reads` → [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-requisitos-rol|RequisitosRolController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
