---
id: service--personal-actividad-profesional
tipo: SERVICE
nombre: ActividadProfesionalService
nivel: L2
dominio: personal
resumen: Logica de negocio de actividad profesional (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/actividad-profesional.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--actividad-profesional]
  - [reads, table--personal-actividad-profesional]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
terminos: [actividad, profesional, personal, bombero]
---

# ActividadProfesionalService

Logica de negocio de actividad profesional (modulo personal).


## Metodos

`obtener()` · `actualizar()`

## Archivos

- `backend/src/modules/personal/actividad-profesional.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--actividad-profesional|ActividadProfesional]]
- `reads` → [[table--personal-actividad-profesional|personal.actividad_profesional]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[api--personal-actividad-profesional|ActividadProfesionalController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
