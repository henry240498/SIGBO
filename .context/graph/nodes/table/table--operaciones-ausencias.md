---
id: table--operaciones-ausencias
tipo: TABLE
nombre: operaciones.ausencias
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.ausencias (11 columnas). Creada en 086_campo_adjuntos_ausencias.sql.
tabla: ausencias
archivos:
  - database/migrations/086_campo_adjuntos_ausencias.sql
edges:
  - [defined_in, file--086-campo-adjuntos-ausencias]
  - [belongs_to, domain--asistencia]
  - [references, table--personal-bomberos]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [operaciones, ausencias, bombero, desde, hasta, motivo, estado, decision, solicitada, decidida, creado]
---

# operaciones.ausencias

Tabla operaciones.ausencias (11 columnas). Creada en 086_campo_adjuntos_ausencias.sql.

- **Esquema:** operaciones · **Columnas:** 11

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA')`
- `hasta >= desde`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `solicitada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `decidida_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| desde | DATE |
| hasta | DATE |
| motivo | NVARCHAR(300) |
| estado | NVARCHAR(12) |
| motivo_decision | NVARCHAR(300) |
| solicitada_por | UNIQUEIDENTIFIER |
| decidida_por | UNIQUEIDENTIFIER |
| decidida_en | DATETIMEOFFSET(3) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/086_campo_adjuntos_ausencias.sql`

## Relaciones

- `defined_in` → [[file--086-campo-adjuntos-ausencias|086_campo_adjuntos_ausencias.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
