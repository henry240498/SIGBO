---
id: service--vehiculos-vehiculos-autorizados
tipo: SERVICE
nombre: VehiculosAutorizadosService
nivel: L2
dominio: vehiculos
resumen: Logica de negocio de vehiculos autorizados (modulo vehiculos).
capa: backend
archivos:
  - backend/src/modules/vehiculos/vehiculos-autorizados.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-vehiculos]
  - [uses, entity--vehiculo-autorizado]
  - [reads, table--personal-vehiculos-autorizados]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
terminos: [vehiculos, autorizados, vehiculo, autorizado]
---

# VehiculosAutorizadosService

Logica de negocio de vehiculos autorizados (modulo vehiculos).


## Metodos

`listar()` · `reemplazar()`

## Archivos

- `backend/src/modules/vehiculos/vehiculos-autorizados.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-vehiculos|vehiculos (modulo NestJS)]]
- `uses` → [[entity--vehiculo-autorizado|VehiculoAutorizado]]
- `reads` → [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Referenciado por

- [[api--vehiculos-vehiculos-autorizados|VehiculosAutorizadosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
