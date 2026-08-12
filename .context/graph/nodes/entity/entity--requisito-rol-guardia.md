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
