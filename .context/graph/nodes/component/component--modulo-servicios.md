---
id: component--modulo-servicios
tipo: COMPONENT
nombre: servicios (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de servicios.
capa: backend
archivos:
  - backend/src/modules/servicios/servicios.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [servicios, modulo]
---

# servicios (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de servicios.


## Entidades registradas (forFeature)

Servicio, TipoServicio, ComunicacionServicio, LogAuditoria, Bombero, Vehiculo

## Archivos

- `backend/src/modules/servicios/servicios.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--servicios-servicios|ServiciosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
