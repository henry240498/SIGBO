---
id: component--modulo-auth
tipo: COMPONENT
nombre: auth (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de auth.
capa: backend
archivos:
  - backend/src/modules/auth/auth.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [auth, modulo]
---

# auth (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de auth.


## Entidades registradas (forFeature)

Usuario, Sesion, AsignacionRol, Rol

## Archivos

- `backend/src/modules/auth/auth.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
