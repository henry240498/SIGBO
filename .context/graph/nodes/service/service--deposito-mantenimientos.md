---
id: service--deposito-mantenimientos
tipo: SERVICE
nombre: MantenimientosService
nivel: L2
dominio: deposito
resumen: "Mantenimiento estructurado (seccion 14 del pedido): a diferencia de un movimiento manual generico con tipo \"Mantenimiento\", esto ademas guarda taller/responsable, fecha estimada de salida, fecha real y costo, y reutiliza el motor de MovimientosDepositoService para mover la tenencia a \"En taller\" al ingresar y de vuelta a \"En deposito\" al finalizar -- nunca edita tenencias por fuera de ese mecanismo."
capa: backend
archivos:
  - backend/src/modules/deposito/mantenimientos.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--mantenimiento-deposito]
  - [reads, table--deposito-mantenimientos]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, service--deposito-movimientos-deposito]
  - [uses, service--seguridad-auditoria]
terminos: [mantenimientos, deposito, mantenimiento, articulo, equipo, tenencia]
---

# MantenimientosService

Mantenimiento estructurado (seccion 14 del pedido): a diferencia de un movimiento manual generico con tipo "Mantenimiento", esto ademas guarda taller/responsable, fecha estimada de salida, fecha real y costo, y reutiliza el motor de MovimientosDepositoService para mover la tenencia a "En taller" al ingresar y de vuelta a "En deposito" al finalizar -- nunca edita tenencias por fuera de ese mecanismo.


## Metodos

`findAll()` · `findOne()` · `create()` · `finalizar()`

## Archivos

- `backend/src/modules/deposito/mantenimientos.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--mantenimiento-deposito|MantenimientoDeposito]]
- `reads` → [[table--deposito-mantenimientos|deposito.mantenimientos]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[service--deposito-movimientos-deposito|MovimientosDepositoService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-mantenimientos|MantenimientosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
