---
id: table--seguridad-permisos
tipo: TABLE
nombre: seguridad.permisos
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.permisos (10 columnas). Creada en 002_seguridad.sql.
tabla: permisos
archivos:
  - database/migrations/002_seguridad.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, permisos, nombre, descripcion, recurso, accion, categoria, sistema, metadata, creado, actualizado]
---

# seguridad.permisos

Tabla seguridad.permisos (10 columnas). Creada en 002_seguridad.sql.

- **Esquema:** seguridad · **Columnas:** 10
- **UNIQUE:** `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| recurso | NVARCHAR(50) |
| accion | NVARCHAR(50) |
| categoria | NVARCHAR(50) |
| es_sistema | BIT |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/002_seguridad.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--permiso|Permiso]] `persisted_in` →
- [[service--seguridad-dashboard|DashboardService]] `reads` →
- [[service--seguridad-permisos|PermisosService]] `reads` →
- [[service--seguridad-policy-engine|PolicyEngineService]] `reads` →
- [[service--seguridad-roles|RolesService]] `reads` →
- [[service--seguridad-usuarios|UsuariosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
