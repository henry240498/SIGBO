---
id: table--operaciones-cambios-guardias
tipo: TABLE
nombre: operaciones.cambios_guardias
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.cambios_guardias (11 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql.
tabla: cambios_guardias
archivos:
  - database/migrations/005_operaciones.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--005-operaciones]
  - [belongs_to, domain--asistencia]
terminos: [operaciones, cambios, guardias, asignacion, original, bombero, nuevo, solicitante, fecha, solicitud, cambio, motivo, estado, aprobado, aprobacion, observaciones]
---

# operaciones.cambios_guardias

Tabla operaciones.cambios_guardias (11 columnas). Creada en 005_operaciones.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** operaciones · **Columnas:** 11

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| asignacion_original_id | UNIQUEIDENTIFIER |
| bombero_nuevo_id | UNIQUEIDENTIFIER |
| solicitante_id | UNIQUEIDENTIFIER |
| fecha_solicitud | DATETIMEOFFSET(3) |
| fecha_cambio | DATE |
| motivo | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| aprobado_por | UNIQUEIDENTIFIER |
| fecha_aprobacion | DATETIMEOFFSET(3) |
| observaciones | NVARCHAR(MAX) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/005_operaciones.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--005-operaciones|005_operaciones.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[entity--cambio-guardia|CambioGuardia]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
