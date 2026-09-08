---
id: table--academia-instructores-externos
tipo: TABLE
nombre: academia.instructores_externos
nivel: L2
dominio: academia
resumen: Tabla academia.instructores_externos (12 columnas). Creada en 036_academia_estructura.sql.
tabla: instructores_externos
archivos:
  - database/migrations/036_academia_estructura.sql
edges:
  - [defined_in, file--036-academia-estructura]
  - [belongs_to, domain--academia]
terminos: [academia, instructores, externos, nombre, apellido, documento, institucion, especialidad, telefono, email, observaciones, activo, creado, actualizado]
---

# academia.instructores_externos

Tabla academia.instructores_externos (12 columnas). Creada en 036_academia_estructura.sql.

- **Esquema:** academia · **Columnas:** 12

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| apellido | NVARCHAR(100) |
| documento | NVARCHAR(20) |
| institucion | NVARCHAR(150) |
| especialidad | NVARCHAR(150) |
| telefono | NVARCHAR(20) |
| email | NVARCHAR(255) |
| observaciones | NVARCHAR(MAX) |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/finanzas/beneficios`
- **Endpoints:** ActividadesAcademicasController, EvaluacionesAcademiaController, InstructoresExternosController
- **Servicios:** ActividadesAcademicasService, EvaluacionesAcademiaService, InstructoresExternosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/036_academia_estructura.sql`

## Relaciones

- `defined_in` → [[file--036-academia-estructura|036_academia_estructura.sql]]
- `belongs_to` → [[domain--academia|Academia]]

## Referenciado por

- [[table--academia-instructores-actividad|academia.instructores_actividad]] `references` →
- [[table--academia-evaluaciones|academia.evaluaciones]] `references` →
- [[entity--instructor-externo|InstructorExterno]] `persisted_in` →
- [[service--academia-actividades-academicas|ActividadesAcademicasService]] `reads` →
- [[service--academia-evaluaciones-academia|EvaluacionesAcademiaService]] `reads` →
- [[service--academia-instructores-externos|InstructoresExternosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
