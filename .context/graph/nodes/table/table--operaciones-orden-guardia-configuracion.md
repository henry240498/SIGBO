---
id: table--operaciones-orden-guardia-configuracion
tipo: TABLE
nombre: operaciones.orden_guardia_configuracion
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.orden_guardia_configuracion (13 columnas). Creada en 030_ordenes_guardia.sql, modificada por 033_orden_guardia_drop_columnas_redundantes.sql.
tabla: orden_guardia_configuracion
archivos:
  - database/migrations/030_ordenes_guardia.sql
  - database/migrations/033_orden_guardia_drop_columnas_redundantes.sql
edges:
  - [defined_in, file--030-ordenes-guardia]
  - [belongs_to, domain--asistencia]
  - [references, table--organizacion-cargos]
  - [references, table--organizacion-cargos]
terminos: [operaciones, orden, guardia, configuracion, titulo, documento, texto, intro, plantilla, regla, oficial, chofer, exigir, rango, igual, superior, pie, firmante1, cargo, etiqueta, firmante2, actualizado]
---

# operaciones.orden_guardia_configuracion

Tabla operaciones.orden_guardia_configuracion (13 columnas). Creada en 030_ordenes_guardia.sql, modificada por 033_orden_guardia_drop_columnas_redundantes.sql.

- **Esquema:** operaciones · **Columnas:** 13

## Llaves foraneas

- `firmante1_cargo_id` → [[table--organizacion-cargos|organizacion.cargos]]
- `firmante2_cargo_id` → [[table--organizacion-cargos|organizacion.cargos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| titulo_documento | NVARCHAR(300) |
| texto_intro_plantilla | NVARCHAR(MAX) |
| regla_texto_oficial | NVARCHAR(MAX) |
| regla_texto_chofer | NVARCHAR(MAX) |
| exigir_rango_igual_o_superior_oficial | BIT |
| texto_pie | NVARCHAR(MAX) |
| firmante1_cargo_id | UNIQUEIDENTIFIER |
| firmante1_etiqueta | NVARCHAR(150) |
| firmante2_cargo_id | UNIQUEIDENTIFIER |
| firmante2_etiqueta | NVARCHAR(150) |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** OrdenesGuardiaController
- **Servicios:** OrdenGuardiaConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/030_ordenes_guardia.sql`
- `database/migrations/033_orden_guardia_drop_columnas_redundantes.sql`

## Relaciones

- `defined_in` → [[file--030-ordenes-guardia|030_ordenes_guardia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--organizacion-cargos|organizacion.cargos]]
- `references` → [[table--organizacion-cargos|organizacion.cargos]]

## Referenciado por

- [[entity--orden-guardia-configuracion|OrdenGuardiaConfiguracion]] `persisted_in` →
- [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
