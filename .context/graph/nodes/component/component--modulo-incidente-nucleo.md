---
id: component--modulo-incidente-nucleo
tipo: COMPONENT
nombre: incidente-nucleo (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de incidente-nucleo.
capa: backend
archivos:
  - backend/src/modules/incidente-nucleo/incidente-nucleo.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [incidente, nucleo, modulo]
---

# incidente-nucleo (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de incidente-nucleo.


## Archivos

- `backend/src/modules/incidente-nucleo/incidente-nucleo.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--incidente-nucleo-cronologia|CronologiaService]] `uses` →
- [[service--incidente-nucleo-motor-fases|MotorFases]] `uses` →
- [[decision--matpel-catalogo-contexto-versionados|GRE versionada y MATPEL sobre el mismo Servicio y cronología]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
