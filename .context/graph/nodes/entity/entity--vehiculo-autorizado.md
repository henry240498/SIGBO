---
id: entity--vehiculo-autorizado
tipo: ENTITY
nombre: VehiculoAutorizado
nivel: L1
dominio: personal
resumen: Entidad VehiculoAutorizado, persistida en personal.vehiculos_autorizados.
tabla: personal.vehiculos_autorizados
archivos:
  - backend/src/shared/entities/vehiculo-autorizado.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-vehiculos-autorizados]
terminos: [vehiculo, autorizado, vehiculos, autorizados, personal]
---

# VehiculoAutorizado

Entidad VehiculoAutorizado, persistida en personal.vehiculos_autorizados.

- **Tabla:** [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]]
- **Columnas mapeadas:** 6

## Archivos

- `backend/src/shared/entities/vehiculo-autorizado.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]]

## Referenciado por

- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `uses` →
- [[rule--elegibilidad-de-rol-guardia|La elegibilidad para un rol de guardia se configura en tablas, con OR entre filas y AND entre columnas]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
