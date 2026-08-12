---
id: service--seguridad-dashboard
tipo: SERVICE
nombre: DashboardService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de dashboard (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/dashboard.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, entity--rol]
  - [reads, table--seguridad-roles]
  - [uses, entity--permiso]
  - [reads, table--seguridad-permisos]
  - [uses, service--seguridad-sesiones]
  - [uses, service--seguridad-auditoria]
terminos: [seguridad, usuario, rol, permiso]
---

# DashboardService

Logica de negocio de dashboard (modulo seguridad).


## Metodos

`obtener()`

## Archivos

- `backend/src/modules/seguridad/dashboard.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[entity--rol|Rol]]
- `reads` → [[table--seguridad-roles|seguridad.roles]]
- `uses` → [[entity--permiso|Permiso]]
- `reads` → [[table--seguridad-permisos|seguridad.permisos]]
- `uses` → [[service--seguridad-sesiones|SesionesService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--organizacion-dashboard|DashboardController]] `exposes` →
- [[api--seguridad-dashboard|DashboardController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
