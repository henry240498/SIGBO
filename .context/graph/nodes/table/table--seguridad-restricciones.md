---
id: table--seguridad-restricciones
tipo: TABLE
nombre: seguridad.restricciones
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.restricciones (9 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.
tabla: restricciones
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, restricciones, permiso, nombre, descripcion, tipo, condicion, prioridad, activo, creado]
---

# seguridad.restricciones

Tabla seguridad.restricciones (9 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** seguridad · **Columnas:** 9

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| permiso_id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| tipo | NVARCHAR(50) |
| condicion | NVARCHAR(MAX) |
| prioridad | INT |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
