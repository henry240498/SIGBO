---
id: service--auth-auth
tipo: SERVICE
nombre: AuthService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de auth (modulo auth).
capa: backend
archivos:
  - backend/src/modules/auth/auth.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-auth]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, entity--sesion]
  - [reads, table--seguridad-sesiones]
  - [uses, entity--asignacion-rol]
  - [reads, table--seguridad-asignacion-roles]
  - [uses, entity--rol]
  - [reads, table--seguridad-roles]
  - [uses, service--seguridad-policy-engine]
  - [uses, service--seguridad-auditoria]
terminos: [auth, usuario, sesion, asignacion, rol]
---

# AuthService

Logica de negocio de auth (modulo auth).


## Metodos

`login()` · `refresh()` · `logout()`

## Archivos

- `backend/src/modules/auth/auth.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-auth|auth (modulo NestJS)]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[entity--sesion|Sesion]]
- `reads` → [[table--seguridad-sesiones|seguridad.sesiones]]
- `uses` → [[entity--asignacion-rol|AsignacionRol]]
- `reads` → [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]]
- `uses` → [[entity--rol|Rol]]
- `reads` → [[table--seguridad-roles|seguridad.roles]]
- `uses` → [[service--seguridad-policy-engine|PolicyEngineService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--auth-auth|AuthController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
