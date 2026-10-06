---
id: service--flota-disponibilidad
tipo: SERVICE
nombre: DisponibilidadService
nivel: L2
dominio: vehiculos
resumen: "2.3 Disponibilidad en vivo: que se puede mandar ahora mismo."
capa: backend
archivos:
  - backend/src/modules/flota/disponibilidad.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-flota]
terminos: [disponibilidad, flota]
---

# DisponibilidadService

2.3 Disponibilidad en vivo: que se puede mandar ahora mismo.


## Metodos

`if()` · `if()` · `consultar()`

## Archivos

- `backend/src/modules/flota/disponibilidad.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-flota|flota (modulo NestJS)]]

## Referenciado por

- [[api--flota-flota|FlotaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
