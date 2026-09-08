---
id: entity--requisito-rol-guardia
tipo: ENTITY
nombre: RequisitoRolGuardia
nivel: L1
dominio: asistencia
resumen: "Regla configurable de elegibilidad para un rol de guardia (seccion 7: \"estas reglas deben ser configurables y no estar quemadas en el frontend\"). Un bombero califica para `rol` si coincide con ALGUNA fila de este tipo (OR entre filas), cumpliendo TODAS las columnas no nulas de esa fila (AND entre columnas). Ejemplo: fila (rol='CHOFER', cargoIdRequerido=<id de Chofer>) exige que el bombero tenga ese cargo; una fila con varias columnas no nulas exige todas."
tabla: operaciones.requisitos_rol_guardia
archivos:
  - backend/src/shared/entities/requisito-rol-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-requisitos-rol-guardia]
terminos: [requisito, rol, guardia, requisitos, operaciones]
---

# RequisitoRolGuardia

Regla configurable de elegibilidad para un rol de guardia (seccion 7: "estas reglas deben ser configurables y no estar quemadas en el frontend"). Un bombero califica para `rol` si coincide con ALGUNA fila de este tipo (OR entre filas), cumpliendo TODAS las columnas no nulas de esa fila (AND entre columnas). Ejemplo: fila (rol='CHOFER', cargoIdRequerido=<id de Chofer>) exige que el bombero tenga ese cargo; una fila con varias columnas no nulas exige todas.

- **Tabla:** [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]]
- **Columnas mapeadas:** 5

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`
- **Endpoints:** RequisitosRolController
- **Servicios:** ElegibilidadService, RequisitosRolService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/requisito-rol-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]]

## Referenciado por

- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `uses` →
- [[rule--elegibilidad-de-rol-guardia|La elegibilidad para un rol de guardia se configura en tablas, con OR entre filas y AND entre columnas]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
