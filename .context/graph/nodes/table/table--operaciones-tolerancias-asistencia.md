---
id: table--operaciones-tolerancias-asistencia
tipo: TABLE
nombre: operaciones.tolerancias_asistencia
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.tolerancias_asistencia (8 columnas). Creada en 020_asistencia.sql.
tabla: tolerancias_asistencia
archivos:
  - database/migrations/020_asistencia.sql
edges:
  - [defined_in, file--020-asistencia]
  - [belongs_to, domain--asistencia]
  - [references, table--organizacion-parametros]
terminos: [operaciones, tolerancias, asistencia, tipo, evento, minutos, tolerancia, entrada, salida, estado, institucion, creado, actualizado]
---

# operaciones.tolerancias_asistencia

Tabla operaciones.tolerancias_asistencia (8 columnas). Creada en 020_asistencia.sql.

- **Esquema:** operaciones · **Columnas:** 8

## Llaves foraneas

- `tipo_evento_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_evento_id | UNIQUEIDENTIFIER |
| minutos_tolerancia_entrada | INT |
| minutos_tolerancia_salida | INT |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`
- **Endpoints:** ToleranciasController
- **Servicios:** ToleranciasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/020_asistencia.sql`

## Relaciones

- `defined_in` → [[file--020-asistencia|020_asistencia.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[entity--tolerancia-asistencia|ToleranciaAsistencia]] `persisted_in` →
- [[service--operaciones-tolerancias|ToleranciasService]] `reads` →
- [[rule--tolerancia-null-es-la-general|La tolerancia con tipoEventoId NULL es la regla general por defecto]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
