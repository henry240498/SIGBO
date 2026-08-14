---
id: table--organizacion-cargos
tipo: TABLE
nombre: organizacion.cargos
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.cargos (13 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.
tabla: cargos
archivos:
  - database/migrations/012_organizacion.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, cargos, codigo, nombre, descripcion, area, nivel, dependencia, cargo, estado, creado, actualizado, eliminado]
---

# organizacion.cargos

Tabla organizacion.cargos (13 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql.

- **Esquema:** organizacion · **Columnas:** 13
- **UNIQUE:** `codigo`, `nombre`

## Llaves foraneas

- `dependencia_cargo_id` → [[table--organizacion-cargos|organizacion.cargos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| area | NVARCHAR(100) |
| nivel | INT |
| dependencia_cargo_id | UNIQUEIDENTIFIER |
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

- [[table--organizacion-designaciones|organizacion.designaciones]] `references` →
<<<<<<< Updated upstream
- [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]] `references` →
=======
>>>>>>> Stashed changes
- [[entity--cargo|Cargo]] `persisted_in` →
- [[service--organizacion-cargos|CargosService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-designaciones|DesignacionesService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
