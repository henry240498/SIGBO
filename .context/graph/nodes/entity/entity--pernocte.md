---
id: entity--pernocte
tipo: ENTITY
nombre: Pernocte
nivel: L1
dominio: asistencia
resumen: "Pernoctar en el cuartel NO es lo mismo que estar de guardia (seccion 8 del pedido) -- por eso vive en tabla propia, nunca como fila de asignacion_guardias. `guardiaId` es opcional, solo como contexto."
tabla: operaciones.pernoctes
archivos:
  - backend/src/shared/entities/pernocte.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-pernoctes]
terminos: [pernocte, pernoctes, operaciones]
---

# Pernocte

Pernoctar en el cuartel NO es lo mismo que estar de guardia (seccion 8 del pedido) -- por eso vive en tabla propia, nunca como fila de asignacion_guardias. `guardiaId` es opcional, solo como contexto.

- **Tabla:** [[table--operaciones-pernoctes|operaciones.pernoctes]]
- **Columnas mapeadas:** 8

## Archivos

- `backend/src/shared/entities/pernocte.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-pernoctes|operaciones.pernoctes]]

## Referenciado por

- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[rule--guardias-vive-en-operaciones|Guardias es un modulo propio cuyas tablas viven en el esquema operaciones]] `affects` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
