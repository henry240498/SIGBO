---
id: domain--academia
tipo: DOMAIN
nombre: Academia
nivel: L0
dominio: academia
estado: PLANIFICADO
resumen: "Modulo funcional \"Academia\". Declarado pero aun no habilitado (disponible: false)."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [academia]
---

# Academia

Modulo funcional "Academia". Declarado pero aun no habilitado (disponible: false).


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--curso|Curso]] `belongs_to` →
- [[entity--inscripcion-curso|InscripcionCurso]] `belongs_to` →
- [[entity--materia|Materia]] `belongs_to` →
- [[table--academia-aspirantes|academia.aspirantes]] `belongs_to` →
- [[table--academia-materias|academia.materias]] `belongs_to` →
- [[table--academia-cursos|academia.cursos]] `belongs_to` →
- [[table--academia-inscripciones-cursos|academia.inscripciones_cursos]] `belongs_to` →
- [[table--academia-examenes|academia.examenes]] `belongs_to` →
- [[table--academia-notas-examenes|academia.notas_examenes]] `belongs_to` →
- [[table--academia-asistencia-academia|academia.asistencia_academia]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
