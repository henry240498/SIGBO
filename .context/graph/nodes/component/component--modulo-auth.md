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
- [[decision--cliente-nativo-exento-de-csrf|El cliente nativo móvil queda exento de la comprobación de Origin del CSRF]] `constrains` →
- [[decision--sesion-mantenida-o-corta|La sesión depende de "Mantener sesión iniciada": 30 días renovables, 12 horas, o los 7 de siempre]] `constrains` →
- [[rule--confidencial-lo-decide-la-matriz|Qué información confidencial ve una persona lo decide la matriz de pantallas, en el backend]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
