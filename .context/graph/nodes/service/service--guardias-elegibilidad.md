---
id: service--guardias-elegibilidad
tipo: SERVICE
nombre: ElegibilidadService
nivel: L2
dominio: guardias
resumen: "Valida elegibilidad de rol de forma configurable (seccion 7 del pedido: \"estas reglas deben ser configurables y no estar quemadas en el frontend\"). Un bombero califica para `rol` si coincide con ALGUNA fila activa de requisitos_rol_guardia para ese rol (OR entre filas), cumpliendo TODAS las columnas no nulas de esa fila (AND entre columnas). Si no hay ninguna fila configurada para el rol, no se restringe por esta via. Caso especial explicito del pedido: el rol CHOFER ademas exige que el bombero tenga al menos un registro en personal.vehiculos_autorizados (\"Solamente otro personal autorizado como chofer puede reemplazarlo\")."
capa: backend
archivos:
  - backend/src/modules/guardias/elegibilidad.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--requisito-rol-guardia]
  - [reads, table--operaciones-requisitos-rol-guardia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--vehiculo-autorizado]
  - [reads, table--personal-vehiculos-autorizados]
terminos: [elegibilidad, guardias, requisito, rol, guardia, bombero, vehiculo, autorizado]
---

# ElegibilidadService

Valida elegibilidad de rol de forma configurable (seccion 7 del pedido: "estas reglas deben ser configurables y no estar quemadas en el frontend"). Un bombero califica para `rol` si coincide con ALGUNA fila activa de requisitos_rol_guardia para ese rol (OR entre filas), cumpliendo TODAS las columnas no nulas de esa fila (AND entre columnas). Si no hay ninguna fila configurada para el rol, no se restringe por esta via. Caso especial explicito del pedido: el rol CHOFER ademas exige que el bombero tenga al menos un registro en personal.vehiculos_autorizados ("Solamente otro personal autorizado como chofer puede reemplazarlo").


## Metodos

`validar()`

## Archivos

- `backend/src/modules/guardias/elegibilidad.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--requisito-rol-guardia|RequisitoRolGuardia]]
- `reads` → [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--vehiculo-autorizado|VehiculoAutorizado]]
- `reads` → [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]]

## Referenciado por

- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[rule--elegibilidad-de-rol-guardia|La elegibilidad para un rol de guardia se configura en tablas, con OR entre filas y AND entre columnas]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
