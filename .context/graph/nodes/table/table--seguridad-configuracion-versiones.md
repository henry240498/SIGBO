---
id: table--seguridad-configuracion-versiones
tipo: TABLE
nombre: seguridad.configuracion_versiones
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.configuracion_versiones (10 columnas). Creada en 021_configuracion_integral.sql.
tabla: configuracion_versiones
archivos:
  - database/migrations/021_configuracion_integral.sql
edges:
  - [defined_in, file--021-configuracion-integral]
  - [belongs_to, domain--seguridad]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [seguridad, configuracion, versiones, numero, estado, valores, json, motivo, base, version, creado, publicado]
---

# seguridad.configuracion_versiones

Tabla seguridad.configuracion_versiones (10 columnas). Creada en 021_configuracion_integral.sql.

- **Esquema:** seguridad · **Columnas:** 10
- **UNIQUE:** `numero`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('BORRADOR','PUBLICADO','ARCHIVADO')`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `publicado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| numero | INT |
| estado | NVARCHAR(30) |
| valores_json | NVARCHAR(MAX) |
| motivo | NVARCHAR(500) |
| base_version | INT |
| creado_por | UNIQUEIDENTIFIER |
| publicado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| publicado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil/preferencias`, `/dashboard/seguridad/configuracion`
- **Endpoints:** ConfiguracionController
- **Servicios:** ConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/021_configuracion_integral.sql`

## Relaciones

- `defined_in` → [[file--021-configuracion-integral|021_configuracion_integral.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--configuracion-version|ConfiguracionVersion]] `persisted_in` →
- [[service--configuracion-configuracion|ConfiguracionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
