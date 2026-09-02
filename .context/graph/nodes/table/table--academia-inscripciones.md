---
id: table--academia-inscripciones
tipo: TABLE
nombre: academia.inscripciones
nivel: L2
dominio: academia
resumen: Tabla academia.inscripciones (17 columnas). Creada en 036_academia_estructura.sql, modificada por 064_finanzas_beneficios_socios.sql.
tabla: inscripciones
archivos:
  - database/migrations/036_academia_estructura.sql
  - database/migrations/064_finanzas_beneficios_socios.sql
edges:
  - [defined_in, file--036-academia-estructura]
  - [belongs_to, domain--academia]
  - [references, table--academia-actividades]
  - [references, table--personal-bomberos]
  - [references, table--operaciones-participantes-externos]
  - [references, table--organizacion-parametros]
terminos: [academia, inscripciones, actividad, bombero, participante, externo, fecha, inscripcion, estado, resultado, final, observaciones, creado, actualizado, costo, base, beneficio, aplicado, descuento, importe]
---

# academia.inscripciones

Tabla academia.inscripciones (17 columnas). Creada en 036_academia_estructura.sql, modificada por 064_finanzas_beneficios_socios.sql.

- **Esquema:** academia · **Columnas:** 17
- **UNIQUE:** `actividad_id, participante_id`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN (N'INSCRITO',N'ACTIVO',N'RETIRADO',N'FINALIZADO')), CONSTRAINT CK_acad_insc_participante CHECK ( (bombero_id IS NOT NULL AND participante_externo_id IS NULL) OR (bombero_id IS NULL AND participante_externo_id IS NOT NULL`

## Llaves foraneas

- `actividad_id` → [[table--academia-actividades|academia.actividades]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `participante_externo_id` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- `resultado_final_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| actividad_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| participante_externo_id | UNIQUEIDENTIFIER |
| participante_id | AS |
| fecha_inscripcion | DATE |
| estado | NVARCHAR(20) |
| resultado_final_id | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |
| costo_base | DECIMAL(15,2) |
| beneficio_aplicado_id | UNIQUEIDENTIFIER |
| descuento_importe | DECIMAL(15,2) |
| costo_final | DECIMAL(15,2) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** ConsultasAcademiaController, ConsultasCruzadasController, EvaluacionesAcademiaController, FojaServicioController, InscripcionesAcademiaController, SesionesAcademiaController
- **Servicios:** ConsultasAcademiaService, ConsultasCruzadasService, EvaluacionesAcademiaService, FojaServicioService, IaToolsService, InscripcionesAcademiaService, SesionesAcademiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/036_academia_estructura.sql`
- `database/migrations/064_finanzas_beneficios_socios.sql`

## Relaciones

- `defined_in` → [[file--036-academia-estructura|036_academia_estructura.sql]]
- `belongs_to` → [[domain--academia|Academia]]
- `references` → [[table--academia-actividades|academia.actividades]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--operaciones-participantes-externos|operaciones.participantes_externos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[table--academia-notas-evaluacion|academia.notas_evaluacion]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]] `persisted_in` →
- [[service--academia-consultas-academia|ConsultasAcademiaService]] `reads` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--academia-sesiones-academia|SesionesAcademiaService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
