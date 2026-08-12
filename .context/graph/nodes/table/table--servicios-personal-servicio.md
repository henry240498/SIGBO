---
id: table--servicios-personal-servicio
tipo: TABLE
nombre: servicios.personal_servicio
nivel: L2
dominio: servicios
resumen: Tabla servicios.personal_servicio (6 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql.
tabla: personal_servicio
archivos:
  - database/migrations/007_servicios.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--007-servicios]
  - [belongs_to, domain--servicios]
terminos: [servicios, personal, servicio, bombero, rol, horas, observaciones]
---

# servicios.personal_servicio

Tabla servicios.personal_servicio (6 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** servicios · **Columnas:** 6
- **UNIQUE:** `servicio_id, bombero_id`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| rol | NVARCHAR(50) |
| horas_servicio | INT |
| observaciones | NVARCHAR(MAX) |

## Archivos

- `database/migrations/007_servicios.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--007-servicios|007_servicios.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[entity--personal-servicio|PersonalServicio]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
