---
id: table--operaciones-puntos-fichaje
tipo: TABLE
nombre: operaciones.puntos_fichaje
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.puntos_fichaje (6 columnas). Creada en 082_control_personal.sql.
tabla: puntos_fichaje
archivos:
  - database/migrations/082_control_personal.sql
edges:
  - [defined_in, file--082-control-personal]
  - [belongs_to, domain--asistencia]
  - [references, table--seguridad-usuarios]
terminos: [operaciones, puntos, fichaje, nombre, token, hash, activo, creado]
---

# operaciones.puntos_fichaje

Tabla operaciones.puntos_fichaje (6 columnas). Creada en 082_control_personal.sql.

- **Esquema:** operaciones · **Columnas:** 6
- **UNIQUE:** `token_hash`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| token_hash | CHAR(64) |
| activo | BIT |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/082_control_personal.sql`

## Relaciones

- `defined_in` → [[file--082-control-personal|082_control_personal.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--operaciones-fichajes|operaciones.fichajes]] `references` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
