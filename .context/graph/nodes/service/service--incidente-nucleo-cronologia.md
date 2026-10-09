---
id: service--incidente-nucleo-cronologia
tipo: SERVICE
nombre: CronologiaService
nivel: L2
dominio: servicios
resumen: "Bitacora unica del incidente. Se escribe SIEMPRE con el EntityManager de la transaccion de la accion: si la accion se revierte, el evento tambien. La tabla rechaza UPDATE y DELETE."
capa: backend
archivos:
  - backend/src/modules/incidente-nucleo/cronologia.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-incidente-nucleo]
terminos: [cronologia, incidente, nucleo]
---

# CronologiaService

Bitacora unica del incidente. Se escribe SIEMPRE con el EntityManager de la transaccion de la accion: si la accion se revierte, el evento tambien. La tabla rechaza UPDATE y DELETE.


## Metodos

`if()` · `if()` · `if()` · `if()` · `if()` · `registrar()` · `verificarIdempotencia()` · `buscarPorClave()` · `nombreDe()`

## Archivos

- `backend/src/modules/incidente-nucleo/cronologia.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-incidente-nucleo|incidente-nucleo (modulo NestJS)]]

## Referenciado por

- [[decision--matpel-catalogo-contexto-versionados|GRE versionada y MATPEL sobre el mismo Servicio y cronología]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
