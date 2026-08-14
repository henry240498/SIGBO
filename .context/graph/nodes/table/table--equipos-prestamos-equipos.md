---
id: table--equipos-prestamos-equipos
tipo: TABLE
nombre: equipos.prestamos_equipos
nivel: L2
dominio: equipos
resumen: Tabla equipos.prestamos_equipos (11 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 018_parametros_y_normalizacion_personal.sql.
tabla: prestamos_equipos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/018_parametros_y_normalizacion_personal.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, prestamos, equipo, bombero, servicio, fecha, prestamo, devolucion, estado, observaciones, creado, comprometida]
---

# equipos.prestamos_equipos

Tabla equipos.prestamos_equipos (11 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 018_parametros_y_normalizacion_personal.sql.

- **Esquema:** equipos · **Columnas:** 11

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| fecha_prestamo | DATE |
| fecha_devolucion | DATE |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| fecha_devolucion_comprometida | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/018_parametros_y_normalizacion_personal.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[entity--prestamo-equipo|PrestamoEquipo]] `persisted_in` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `reads` →
<<<<<<< Updated upstream
- [[service--equipos-equipos|EquiposService]] `reads` →
=======
>>>>>>> Stashed changes

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
