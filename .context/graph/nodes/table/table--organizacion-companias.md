---
id: table--organizacion-companias
tipo: TABLE
nombre: organizacion.companias
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.companias (12 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: companias
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, companias, codigo, nombre, ciudad, direccion, fecha, creacion, estado, creado, actualizado, eliminado]
---

# organizacion.companias

Tabla organizacion.companias (12 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 12
- **UNIQUE:** `codigo`, `nombre`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| ciudad | NVARCHAR(100) |
| direccion | NVARCHAR(MAX) |
| fecha_creacion | DATE |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/012_organizacion.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--organizacion-cuarteles|organizacion.cuarteles]] `references` →
- [[table--organizacion-designaciones|organizacion.designaciones]] `references` →
- [[entity--compania|Compania]] `persisted_in` →
- [[service--organizacion-companias|CompaniasService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-designaciones|DesignacionesService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
