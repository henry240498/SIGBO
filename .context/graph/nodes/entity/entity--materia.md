---
id: entity--materia
tipo: ENTITY
nombre: Materia
nivel: L1
dominio: academia
resumen: Catalogo de materias academicas (schema academia).
tabla: academia.materias
archivos:
  - backend/src/shared/entities/materia.entity.ts
edges:
  - [belongs_to, domain--academia]
  - [persisted_in, table--academia-materias]
terminos: [materia, materias, academia, nivel, basico, intermedio, avanzado]
---

# Materia

Catalogo de materias academicas (schema academia).

- **Tabla:** [[table--academia-materias|academia.materias]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `NivelMateria`: `BASICO` · `INTERMEDIO` · `AVANZADO`

## Archivos

- `backend/src/shared/entities/materia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `persisted_in` → [[table--academia-materias|academia.materias]]

## Referenciado por

- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
