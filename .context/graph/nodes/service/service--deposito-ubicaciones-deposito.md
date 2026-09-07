---
id: service--deposito-ubicaciones-deposito
tipo: SERVICE
nombre: UbicacionesDepositoService
nivel: L2
dominio: deposito
resumen: Logica de negocio de ubicaciones deposito (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/ubicaciones-deposito.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--ubicacion-deposito]
  - [reads, table--deposito-ubicaciones]
  - [uses, service--seguridad-auditoria]
terminos: [ubicaciones, deposito, ubicacion]
---

# UbicacionesDepositoService

Logica de negocio de ubicaciones deposito (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `remove()`

## Archivos

- `backend/src/modules/deposito/ubicaciones-deposito.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--ubicacion-deposito|UbicacionDeposito]]
- `reads` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-ubicaciones-deposito|UbicacionesDepositoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
