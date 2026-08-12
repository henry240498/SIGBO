---
id: entity--rol
tipo: ENTITY
nombre: Rol
nivel: L1
dominio: seguridad
resumen: Entidad Rol, persistida en seguridad.roles.
tabla: seguridad.roles
archivos:
  - backend/src/shared/entities/rol.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-roles]
terminos: [rol, roles, seguridad]
---

# Rol

Entidad Rol, persistida en seguridad.roles.

- **Tabla:** [[table--seguridad-roles|seguridad.roles]]
- **Columnas mapeadas:** 13

## Archivos

- `backend/src/shared/entities/rol.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-roles|seguridad.roles]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
