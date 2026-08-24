---
id: service--deposito-bajas
tipo: SERVICE
nombre: BajasService
nivel: L2
dominio: deposito
resumen: Logica de negocio de bajas (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/bajas.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--baja-deposito]
  - [reads, table--deposito-bajas]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, service--deposito-movimientos-deposito]
  - [uses, service--seguridad-auditoria]
terminos: [bajas, deposito, baja, articulo, equipo, tenencia]
---

# BajasService

Logica de negocio de bajas (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `create()`

## Archivos

- `backend/src/modules/deposito/bajas.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--baja-deposito|BajaDeposito]]
- `reads` → [[table--deposito-bajas|deposito.bajas]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-bajas|BajasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
