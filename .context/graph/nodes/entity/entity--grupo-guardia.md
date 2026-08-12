---
id: entity--grupo-guardia
tipo: ENTITY
nombre: GrupoGuardia
nivel: L1
dominio: asistencia
resumen: "Composicion predefinida de un grupo de guardia (seccion 3 del pedido): al crear una guardia real a partir de un grupo, el sistema recupera automaticamente su personal titular sin tener que volver a cargarlo."
tabla: operaciones.grupos_guardia
archivos:
  - backend/src/shared/entities/grupo-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-grupos-guardia]
terminos: [grupo, guardia, grupos, operaciones, estado, activo, inactivo]
---

# GrupoGuardia

Composicion predefinida de un grupo de guardia (seccion 3 del pedido): al crear una guardia real a partir de un grupo, el sistema recupera automaticamente su personal titular sin tener que volver a cargarlo.

- **Tabla:** [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- **Columnas mapeadas:** 5

## Estados y enumeraciones

- `EstadoGrupoGuardia`: `ACTIVO` · `INACTIVO`

## Archivos

- `backend/src/shared/entities/grupo-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]

## Referenciado por

- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[rule--guardias-vive-en-operaciones|Guardias es un modulo propio cuyas tablas viven en el esquema operaciones]] `affects` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
