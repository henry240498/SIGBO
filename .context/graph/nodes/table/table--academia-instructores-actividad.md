---
id: table--academia-instructores-actividad
tipo: TABLE
nombre: academia.instructores_actividad
nivel: L2
dominio: academia
resumen: Tabla academia.instructores_actividad (6 columnas). Creada en 036_academia_estructura.sql.
tabla: instructores_actividad
archivos:
  - database/migrations/036_academia_estructura.sql
edges:
  - [defined_in, file--036-academia-estructura]
  - [belongs_to, domain--academia]
  - [references, table--academia-actividades]
  - [references, table--personal-bomberos]
  - [references, table--academia-instructores-externos]
terminos: [academia, instructores, actividad, bombero, instructor, externo, rol, creado]
---

# academia.instructores_actividad

Tabla academia.instructores_actividad (6 columnas). Creada en 036_academia_estructura.sql.

- **Esquema:** academia · **Columnas:** 6

## Restricciones CHECK (reglas que la BD impone)

- `rol_instructor IN (N'PRINCIPAL',N'AYUDANTE')), CONSTRAINT CK_acad_inst_persona CHECK ( (bombero_id IS NOT NULL AND instructor_externo_id IS NULL) OR (bombero_id IS NULL AND instructor_externo_id IS NOT NULL`

## Llaves foraneas

- `actividad_id` → [[table--academia-actividades|academia.actividades]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `instructor_externo_id` → [[table--academia-instructores-externos|academia.instructores_externos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| actividad_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| instructor_externo_id | UNIQUEIDENTIFIER |
| rol_instructor | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`, `/dashboard/personal/[id]`
- **Endpoints:** ActividadesAcademicasController
- **Servicios:** ActividadesAcademicasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/036_academia_estructura.sql`

## Relaciones

- `defined_in` → [[file--036-academia-estructura|036_academia_estructura.sql]]
- `belongs_to` → [[domain--academia|Academia]]
- `references` → [[table--academia-actividades|academia.actividades]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--academia-instructores-externos|academia.instructores_externos]]

## Referenciado por

- [[entity--instructor-actividad-academica|InstructorActividadAcademica]] `persisted_in` →
- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
