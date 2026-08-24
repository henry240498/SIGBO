---
id: service--deposito-entradas
tipo: SERVICE
nombre: EntradasService
nivel: L2
dominio: deposito
resumen: Logica de negocio de entradas (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/entradas.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--entrada-deposito]
  - [reads, table--deposito-entradas]
  - [uses, entity--entrada-deposito-item]
  - [reads, table--deposito-entrada-items]
  - [uses, entity--proveedor-deposito]
  - [reads, table--deposito-proveedores]
  - [uses, entity--ubicacion-deposito]
  - [reads, table--deposito-ubicaciones]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, service--deposito-movimientos-deposito]
  - [uses, service--seguridad-auditoria]
terminos: [entradas, deposito, entrada, item, proveedor, ubicacion, articulo, equipo]
---

# EntradasService

Logica de negocio de entradas (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `items()` · `create()`

## Archivos

- `backend/src/modules/deposito/entradas.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--entrada-deposito|EntradaDeposito]]
- `reads` → [[table--deposito-entradas|deposito.entradas]]
- `uses` → [[entity--entrada-deposito-item|EntradaDepositoItem]]
- `reads` → [[table--deposito-entrada-items|deposito.entrada_items]]
- `uses` → [[entity--proveedor-deposito|ProveedorDeposito]]
- `reads` → [[table--deposito-proveedores|deposito.proveedores]]
- `uses` → [[entity--ubicacion-deposito|UbicacionDeposito]]
- `reads` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-entradas|EntradasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
