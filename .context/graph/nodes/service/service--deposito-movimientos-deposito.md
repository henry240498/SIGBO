---
id: service--deposito-movimientos-deposito
tipo: SERVICE
nombre: MovimientosDepositoService
nivel: L2
dominio: deposito
resumen: "Motor central de trazabilidad de Deposito (seccion 6 del pedido): cada movimiento que se registra aca crea SIEMPRE una fila de historial (deposito.movimientos, append-only) y sincroniza deposito.tenencias en la misma transaccion -- nunca se actualiza la ubicacion/estado de un elemento por fuera de este flujo."
capa: backend
archivos:
  - backend/src/modules/deposito/movimientos-deposito.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--movimiento-deposito]
  - [reads, table--deposito-movimientos]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--seguridad-auditoria]
terminos: [movimientos, deposito, movimiento, tenencia, articulo, equipo, parametro]
---

# MovimientosDepositoService

Motor central de trazabilidad de Deposito (seccion 6 del pedido): cada movimiento que se registra aca crea SIEMPRE una fila de historial (deposito.movimientos, append-only) y sincroniza deposito.tenencias en la misma transaccion -- nunca se actualiza la ubicacion/estado de un elemento por fuera de este flujo.


## Metodos

`obtenerParametro()` · `tenenciaDeEquipo()` · `listar()` · `registrarManual()` · `registrar()`

## Archivos

- `backend/src/modules/deposito/movimientos-deposito.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--movimiento-deposito|MovimientoDeposito]]
- `reads` → [[table--deposito-movimientos|deposito.movimientos]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--deposito-articulos|ArticulosService]] `uses` →
- [[service--deposito-bajas|BajasService]] `uses` →
- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →
- [[service--deposito-prestamos|PrestamosService]] `uses` →
- [[api--deposito-movimientos-deposito|MovimientosDepositoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
