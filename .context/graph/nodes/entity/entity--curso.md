---
id: entity--curso
tipo: ENTITY
nombre: Curso
nivel: L1
dominio: academia
resumen: Cursos dictados de una materia (schema academia).
tabla: academia.cursos
archivos:
  - backend/src/shared/entities/curso.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-cursos]
terminos: [curso, cursos, academia, estado, planificado, finalizado, cancelado]
---

# Curso

Cursos dictados de una materia (schema academia).

- **Tabla:** [[table--academia-cursos|academia.cursos]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `EstadoCurso`: `PLANIFICADO` · `EN_CURSO` · `FINALIZADO` · `CANCELADO`

## Archivos

- `backend/src/shared/entities/curso.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-cursos|academia.cursos]]

## Referenciado por

- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
