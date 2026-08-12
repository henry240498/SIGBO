---
id: table--seguridad-configuracion-valores
tipo: TABLE
nombre: seguridad.configuracion_valores
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.configuracion_valores (8 columnas). Creada en 021_configuracion_integral.sql.
tabla: configuracion_valores
archivos:
  - database/migrations/021_configuracion_integral.sql
edges:
  - [defined_in, file--021-configuracion-integral]
  - [belongs_to, domain--seguridad]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [seguridad, configuracion, valores, clave, alcance, usuario, valor, json, version, actualizado]
---

# seguridad.configuracion_valores

Tabla seguridad.configuracion_valores (8 columnas). Creada en 021_configuracion_integral.sql.

- **Esquema:** seguridad · **Columnas:** 8

## Restricciones CHECK (reglas que la BD impone)

- `alcance IN ('GLOBAL','USUARIO')`

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `actualizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| clave | NVARCHAR(160) |
| alcance | NVARCHAR(20) |
| usuario_id | UNIQUEIDENTIFIER |
| valor_json | NVARCHAR(MAX) |
| version | INT |
| actualizado_por | UNIQUEIDENTIFIER |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/021_configuracion_integral.sql`

## Relaciones

- `defined_in` → [[file--021-configuracion-integral|021_configuracion_integral.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--configuracion-valor|ConfiguracionValor]] `persisted_in` →
- [[service--configuracion-configuracion|ConfiguracionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
