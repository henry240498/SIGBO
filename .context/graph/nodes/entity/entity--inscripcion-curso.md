---
id: entity--inscripcion-curso
tipo: ENTITY
nombre: InscripcionCurso
nivel: L1
dominio: academia
resumen: "Inscripciones de bomberos o aspirantes a un curso (schema academia). participante_id es columna calculada: COALESCE(bombero_id, aspirante_id)."
tabla: academia.inscripciones_cursos
archivos:
  - backend/src/shared/entities/inscripcion-curso.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-inscripciones-cursos]
terminos: [inscripcion, curso, inscripciones, cursos, academia, estado, inscrito, activo, retirado, aprobado, reprobado]
---

# InscripcionCurso

Inscripciones de bomberos o aspirantes a un curso (schema academia). participante_id es columna calculada: COALESCE(bombero_id, aspirante_id).

- **Tabla:** [[table--academia-inscripciones-cursos|academia.inscripciones_cursos]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `EstadoInscripcionCurso`: `INSCRITO` · `ACTIVO` · `RETIRADO` · `APROBADO` · `REPROBADO`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** ConsultasCruzadasController
- **Servicios:** ConsultasCruzadasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/inscripcion-curso.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-inscripciones-cursos|academia.inscripciones_cursos]]

## Referenciado por

- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
