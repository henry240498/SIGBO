---
id: service--gre-gre-trabajador
tipo: SERVICE
nombre: GreTrabajadorService
nivel: L2
dominio: matpel
resumen: "Trabajador local de importaciones GRE. Apagado salvo GRE_TRABAJADOR=activo: arrancar la API no extrae ni carga nada. Sin él, `npm run gre:procesar` procesa la cola una vez."
capa: backend
archivos:
  - backend/src/modules/gre/gre-trabajador.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
  - [uses, service--gre-gre-importacion]
terminos: [gre, trabajador]
---

# GreTrabajadorService

Trabajador local de importaciones GRE. Apagado salvo GRE_TRABAJADOR=activo: arrancar la API no extrae ni carga nada. Sin él, `npm run gre:procesar` procesa la cola una vez.


## Metodos

`onApplicationBootstrap()` · `onApplicationShutdown()`

## Archivos

- `backend/src/modules/gre/gre-trabajador.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]
- `uses` → [[service--gre-gre-importacion|GreImportacionService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
