---
id: table--academia-inscripciones-cursos
tipo: TABLE
nombre: academia.inscripciones_cursos
nivel: L2
dominio: academia
resumen: Tabla academia.inscripciones_cursos (12 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.
tabla: inscripciones_cursos
archivos:
  - database/migrations/004_academia.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--004-academia]
  - [belongs_to, domain--academia]
terminos: [academia, inscripciones, cursos, curso, bombero, aspirante, participante, fecha, inscripcion, estado, nota, final, asistencia, total, observaciones, creado, actualizado]
---

# academia.inscripciones_cursos

Tabla academia.inscripciones_cursos (12 columnas). Creada en 004_academia.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** academia · **Columnas:** 12
- **UNIQUE:** `curso_id, participante_id`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('INSCRITO','ACTIVO','RETIRADO','APROBADO','REPROBADO')), /* Exactamente uno de los dos participantes */ CONSTRAINT CK_insc_participante CHECK ( (bombero_id IS NOT NULL AND aspirante_id IS NULL) OR (bombero_id IS NULL AND aspirante_id IS NOT NULL`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| curso_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| aspirante_id | UNIQUEIDENTIFIER |
| participante_id | AS |
| fecha_inscripcion | DATE |
| estado | NVARCHAR(20) |
| nota_final | DECIMAL(5,2) |
| asistencia_total | INT |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** ConsultasCruzadasController
- **Servicios:** ConsultasCruzadasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/004_academia.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--004-academia|004_academia.sql]]
- `belongs_to` → [[domain--academia|Academia]]

## Referenciado por

- [[entity--inscripcion-curso|InscripcionCurso]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
