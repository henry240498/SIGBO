---
id: table--organizacion-cuarteles
tipo: TABLE
nombre: organizacion.cuarteles
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.cuarteles (15 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql, 071_servicios_seguimiento_geografico.sql.
tabla: cuarteles
archivos:
  - database/migrations/012_organizacion.sql
  - database/migrations/071_servicios_seguimiento_geografico.sql
edges:
  - [defined_in, file--012-organizacion]
  - [belongs_to, domain--organizacion]
  - [references, table--organizacion-companias]
terminos: [organizacion, cuarteles, codigo, nombre, compania, direccion, telefono, responsable, bombero, estado, creado, actualizado, eliminado, latitud, longitud]
---

# organizacion.cuarteles

Tabla organizacion.cuarteles (15 columnas). Creada en 012_organizacion.sql, modificada por 012_organizacion.sql, 071_servicios_seguimiento_geografico.sql.

- **Esquema:** organizacion · **Columnas:** 15
- **UNIQUE:** `codigo`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('ACTIVO','INACTIVO')`

## Llaves foraneas

- `compania_id` → [[table--organizacion-companias|organizacion.companias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| compania_id | UNIQUEIDENTIFIER |
| direccion | NVARCHAR(MAX) |
| telefono | NVARCHAR(20) |
| responsable_bombero_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`
- **Endpoints:** CuartelsController, DesignacionesController, SeguimientoGeograficoController
- **Servicios:** CuartelsService, DashboardService, DesignacionesService, SeguimientoGeograficoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/012_organizacion.sql`
- `database/migrations/071_servicios_seguimiento_geografico.sql`

## Relaciones

- `defined_in` → [[file--012-organizacion|012_organizacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `references` → [[table--organizacion-companias|organizacion.companias]]

## Referenciado por

- [[table--organizacion-designaciones|organizacion.designaciones]] `references` →
- [[table--deposito-ubicaciones|deposito.ubicaciones]] `references` →
- [[entity--cuartel|Cuartel]] `persisted_in` →
- [[service--organizacion-cuarteles|CuartelsService]] `reads` →
- [[service--organizacion-dashboard|DashboardService]] `reads` →
- [[service--organizacion-designaciones|DesignacionesService]] `reads` →
- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
