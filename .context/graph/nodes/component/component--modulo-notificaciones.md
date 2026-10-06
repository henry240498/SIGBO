---
id: component--modulo-notificaciones
tipo: COMPONENT
nombre: notificaciones (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de notificaciones.
capa: backend
archivos:
  - backend/src/modules/notificaciones/notificaciones.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [notificaciones, modulo]
---

# notificaciones (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de notificaciones.


## Archivos

- `backend/src/modules/notificaciones/notificaciones.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--notificaciones-telegram|TelegramService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
