---
id: component--modulo-despacho
tipo: COMPONENT
nombre: despacho (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de despacho.
capa: backend
archivos:
  - backend/src/modules/despacho/despacho.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [despacho, modulo]
---

# despacho (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de despacho.


## Archivos

- `backend/src/modules/despacho/despacho.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--despacho-despacho-tiempo-real|DespachoTiempoReal]] `uses` →
- [[service--despacho-despacho|DespachoService]] `uses` →
- [[service--despacho-servicio-activo|ServicioActivoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
