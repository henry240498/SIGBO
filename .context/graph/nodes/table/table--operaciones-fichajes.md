---
id: table--operaciones-fichajes
tipo: TABLE
nombre: operaciones.fichajes
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.fichajes (6 columnas). Creada en 082_control_personal.sql.
tabla: fichajes
archivos:
  - database/migrations/082_control_personal.sql
edges:
  - [defined_in, file--082-control-personal]
  - [belongs_to, domain--asistencia]
  - [references, table--operaciones-puntos-fichaje]
  - [references, table--seguridad-usuarios]
terminos: [operaciones, fichajes, punto, usuario, bombero, tipo, registrado]
---

# operaciones.fichajes

Tabla operaciones.fichajes (6 columnas). Creada en 082_control_personal.sql.

- **Esquema:** operaciones · **Columnas:** 6

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ('ENTRADA', 'SALIDA')`

## Llaves foraneas

- `punto_id` → [[table--operaciones-puntos-fichaje|operaciones.puntos_fichaje]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| punto_id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(10) |
| registrado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/082_control_personal.sql`

## Relaciones

- `defined_in` → [[file--082-control-personal|082_control_personal.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--operaciones-puntos-fichaje|operaciones.puntos_fichaje]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
