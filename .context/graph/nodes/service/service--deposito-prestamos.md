---
id: service--deposito-prestamos
tipo: SERVICE
nombre: PrestamosService
nivel: L2
dominio: deposito
resumen: Logica de negocio de prestamos (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/prestamos.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--prestamo-deposito]
  - [reads, table--deposito-prestamos]
  - [uses, entity--prestamo-deposito-item]
  - [reads, table--deposito-prestamo-items]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, service--deposito-movimientos-deposito]
  - [uses, service--seguridad-auditoria]
terminos: [prestamos, deposito, prestamo, item, articulo, equipo]
---

# PrestamosService

Logica de negocio de prestamos (modulo deposito).


## Metodos

`findAll()` · `vencidos()` · `findOne()` · `items()` · `create()` · `devolver()`

## Archivos

- `backend/src/modules/deposito/prestamos.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--prestamo-deposito|PrestamoDeposito]]
- `reads` → [[table--deposito-prestamos|deposito.prestamos]]
- `uses` → [[entity--prestamo-deposito-item|PrestamoDepositoItem]]
- `reads` → [[table--deposito-prestamo-items|deposito.prestamo_items]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--deposito-alertas-deposito|AlertasDepositoService]] `uses` →
- [[api--deposito-prestamos|PrestamosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
