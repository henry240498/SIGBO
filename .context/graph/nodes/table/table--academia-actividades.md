---
id: table--academia-actividades
tipo: TABLE
nombre: academia.actividades
nivel: L2
dominio: academia
resumen: Tabla academia.actividades (26 columnas). Creada en 036_academia_estructura.sql, modificada por 064_finanzas_beneficios_socios.sql.
tabla: actividades
archivos:
  - database/migrations/036_academia_estructura.sql
  - database/migrations/064_finanzas_beneficios_socios.sql
edges:
  - [defined_in, file--036-academia-estructura]
  - [belongs_to, domain--academia]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--personal-bomberos]
terminos: [academia, actividades, codigo, nombre, tipo, actividad, descripcion, objetivo, institucion, organizadora, fecha, inicio, fin, hora, duracion, horas, modalidad, lugar, responsable, bombero, cupo, requisitos, estado, observaciones, externa, creado, actualizado, costo]
---

# academia.actividades

Tabla academia.actividades (26 columnas). Creada en 036_academia_estructura.sql, modificada por 064_finanzas_beneficios_socios.sql.

- **Esquema:** academia · **Columnas:** 26

## Llaves foraneas

- `tipo_actividad_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `modalidad_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `responsable_bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| nombre | NVARCHAR(200) |
| tipo_actividad_id | UNIQUEIDENTIFIER |
| descripcion | NVARCHAR(MAX) |
| objetivo | NVARCHAR(MAX) |
| institucion_organizadora | NVARCHAR(200) |
| fecha_inicio | DATE |
| fecha_fin | DATE |
| hora_inicio | TIME(0) |
| hora_fin | TIME(0) |
| duracion_horas | DECIMAL(6,2) |
| modalidad_id | UNIQUEIDENTIFIER |
| lugar | NVARCHAR(200) |
| responsable_bombero_id | UNIQUEIDENTIFIER |
| cupo | INT |
| requisitos | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| es_externa | BIT |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |
| costo | DECIMAL(15,2) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** ActividadesAcademicasController, ConsultasAcademiaController, ConsultasCruzadasController, EvaluacionesAcademiaController, FojaServicioController, InscripcionesAcademiaController, ReportesAcademiaController, SesionesAcademiaController
- **Servicios:** ActividadesAcademicasService, ConsultasAcademiaService, ConsultasCruzadasService, EvaluacionesAcademiaService, FojaServicioService, IaToolsService, InscripcionesAcademiaService, ReportesAcademiaService, SesionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/036_academia_estructura.sql`
- `database/migrations/064_finanzas_beneficios_socios.sql`

## Relaciones

- `defined_in` → [[file--036-academia-estructura|036_academia_estructura.sql]]
- `belongs_to` → [[domain--academia|Academia]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--academia-instructores-actividad|academia.instructores_actividad]] `references` →
- [[table--academia-inscripciones|academia.inscripciones]] `references` →
- [[table--academia-evaluaciones|academia.evaluaciones]] `references` →
- [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]] `references` →
- [[entity--actividad-academica|ActividadAcademica]] `persisted_in` →
- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `reads` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `reads` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `reads` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
