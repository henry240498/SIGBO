---
id: component--modulo-reservas
tipo: COMPONENT
nombre: reservas (modulo NestJS)
nivel: L1
dominio: reservas
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de reservas.
capa: backend
archivos:
  - backend/src/modules/reservas/reservas.module.ts
edges:
  - [belongs_to, domain--reservas]
terminos: [reservas, modulo]
---

# reservas (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de reservas.


## Archivos

- `backend/src/modules/reservas/reservas.module.ts`

## Relaciones

- `belongs_to` → [[domain--reservas|Reservas]]

## Referenciado por

- [[service--reservas-reservas|ReservasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
