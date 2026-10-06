---
id: component--modulo-cartografia
tipo: COMPONENT
nombre: cartografia (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de cartografia.
capa: backend
archivos:
  - backend/src/modules/cartografia/cartografia.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [cartografia, modulo]
---

# cartografia (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de cartografia.


## Archivos

- `backend/src/modules/cartografia/cartografia.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--cartografia-cartografia|CartografiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
