---
id: service--gre-motor-matpel
tipo: SERVICE
nombre: MotorMatpelService
nivel: L2
dominio: matpel
resumen: Logica de negocio de motor matpel (modulo gre).
capa: backend
archivos:
  - backend/src/modules/gre/motor-matpel.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
terminos: [motor, matpel, gre]
---

# MotorMatpelService

Logica de negocio de motor matpel (modulo gre).


## Metodos

`evaluar()`

## Archivos

- `backend/src/modules/gre/motor-matpel.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|MATPEL]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]

## Referenciado por

- [[service--gre-matpel-consulta|MatpelConsultaService]] `uses` →
- [[api--gre-matpel-consulta|MatpelConsultaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
