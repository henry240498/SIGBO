---
id: component--modulo-alertas
tipo: COMPONENT
nombre: alertas (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de alertas.
capa: backend
archivos:
  - backend/src/modules/alertas/alertas.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [alertas, modulo]
---

# alertas (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de alertas.


## Entidades registradas (forFeature)

AlertaEmergencia

## Archivos

- `backend/src/modules/alertas/alertas.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--alertas-alertas|AlertasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
