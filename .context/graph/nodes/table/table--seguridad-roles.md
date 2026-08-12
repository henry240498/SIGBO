---
id: table--seguridad-roles
tipo: TABLE
nombre: seguridad.roles
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.roles (16 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql, 011_seguridad_fase1.sql.
tabla: roles
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/011_seguridad_fase1.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, roles, nombre, descripcion, color, icono, prioridad, jerarquia, administrativo, operativo, predeterminado, sistema, metadata, creado, actualizado, activo]
---

# seguridad.roles

Tabla seguridad.roles (16 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql, 011_seguridad_fase1.sql.

- **Esquema:** seguridad · **Columnas:** 16
- **UNIQUE:** `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| color | NVARCHAR(7) |
| icono | NVARCHAR(50) |
| prioridad | INT |
| jerarquia | INT |
| es_administrativo | BIT |
| es_operativo | BIT |
| es_predeterminado | BIT |
| es_sistema | BIT |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| activo | BIT |

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/011_seguridad_fase1.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--rol|Rol]] `persisted_in` →
- [[service--auth-auth|AuthService]] `reads` →
- [[service--seguridad-dashboard|DashboardService]] `reads` →
- [[service--seguridad-roles|RolesService]] `reads` →
- [[service--seguridad-usuarios|UsuariosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
