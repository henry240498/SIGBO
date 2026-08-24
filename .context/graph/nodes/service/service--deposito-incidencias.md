---
id: service--deposito-incidencias
tipo: SERVICE
nombre: IncidenciasService
nivel: L2
dominio: deposito
resumen: Logica de negocio de incidencias (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/incidencias.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--incidencia-deposito]
  - [reads, table--deposito-incidencias]
  - [uses, service--seguridad-auditoria]
terminos: [incidencias, deposito, incidencia]
---

# IncidenciasService

Logica de negocio de incidencias (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `create()` · `resolver()`

## Archivos

- `backend/src/modules/deposito/incidencias.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--incidencia-deposito|IncidenciaDeposito]]
- `reads` → [[table--deposito-incidencias|deposito.incidencias]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-incidencias|IncidenciasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
