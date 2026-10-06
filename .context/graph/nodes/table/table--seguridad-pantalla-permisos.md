---
id: table--seguridad-pantalla-permisos
tipo: TABLE
nombre: seguridad.pantalla_permisos
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.pantalla_permisos (13 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: pantalla_permisos
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--seguridad]
  - [references, table--seguridad-pantallas]
terminos: [seguridad, pantalla, permisos, codigo, sujeto, tipo, ver, crear, editar, eliminar, confidencial, denegar, creado, actualizado]
---

# seguridad.pantalla_permisos

Tabla seguridad.pantalla_permisos (13 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** seguridad · **Columnas:** 13
- **UNIQUE:** `pantalla_codigo, sujeto_tipo, sujeto_id`

## Restricciones CHECK (reglas que la BD impone)

- `sujeto_tipo IN ('ROL', 'USUARIO', 'RANGO', 'CARGO')`

## Llaves foraneas

- `pantalla_codigo` → [[table--seguridad-pantallas|seguridad.pantallas]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| pantalla_codigo | NVARCHAR(10) |
| sujeto_tipo | NVARCHAR(10) |
| sujeto_id | NVARCHAR(100) |
| ver | BIT |
| crear | BIT |
| editar | BIT |
| eliminar | BIT |
| confidencial | BIT |
| denegar | BIT |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]
- `references` → [[table--seguridad-pantallas|seguridad.pantallas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
