---
id: service--seguridad-sesiones
tipo: SERVICE
nombre: SesionesService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de sesiones (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/sesiones.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--sesion]
  - [reads, table--seguridad-sesiones]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
terminos: [sesiones, seguridad, sesion, usuario]
---

# SesionesService

Logica de negocio de sesiones (modulo seguridad).


## Metodos

`findActivas()` · `findByUsuario()` · `cerrarPropia()` · `countConectadosAhora()` · `countActivas()` · `cerrar()` · `cerrarTodas()`

## Archivos

- `backend/src/modules/seguridad/sesiones.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--sesion|Sesion]]
- `reads` → [[table--seguridad-sesiones|seguridad.sesiones]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[api--seguridad-sesiones|SesionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
