---
id: component--modulo-indicadores
tipo: COMPONENT
nombre: indicadores (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de indicadores.
capa: backend
archivos:
  - backend/src/modules/indicadores/indicadores.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [indicadores, modulo]
---

# indicadores (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de indicadores.


## Archivos

- `backend/src/modules/indicadores/indicadores.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--indicadores-indicadores|IndicadoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
