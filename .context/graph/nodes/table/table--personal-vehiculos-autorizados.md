---
id: table--personal-vehiculos-autorizados
tipo: TABLE
nombre: personal.vehiculos_autorizados
nivel: L2
dominio: personal
resumen: Tabla personal.vehiculos_autorizados (8 columnas). Creada en 016_personal_expansion.sql.
tabla: vehiculos_autorizados
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
  - [references, table--vehiculos-vehiculos]
terminos: [personal, vehiculos, autorizados, bombero, vehiculo, categoria, fecha, autorizacion, vigencia, capacitaciones, creado]
---

# personal.vehiculos_autorizados

Tabla personal.vehiculos_autorizados (8 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 8
- **UNIQUE:** `bombero_id, vehiculo_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| categoria | NVARCHAR(50) |
| fecha_autorizacion | DATE |
| vigencia | DATE |
| capacitaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Referenciado por

- [[entity--vehiculo-autorizado|VehiculoAutorizado]] `persisted_in` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `reads` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
