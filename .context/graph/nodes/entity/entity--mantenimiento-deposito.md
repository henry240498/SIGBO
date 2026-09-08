---
id: entity--mantenimiento-deposito
tipo: ENTITY
nombre: MantenimientoDeposito
nivel: L1
dominio: deposito
resumen: "Mantenimiento de un elemento (seccion 14 del pedido): a diferencia del estado generico ESTADO_ELEMENTO_DEPOSITO='En mantenimiento', esta tabla guarda los campos estructurados que pedia el negocio -- taller/responsable, fecha estimada de salida, fecha real, costo -- en vez de dejarlos sueltos en observacion. `movimientoIngresoId`/`movimientoSalidaId` enlazan con el historial real de deposito.movimientos (el mantenimiento nunca mueve la tenencia por fuera de ese mecanismo)."
tabla: deposito.mantenimientos
archivos:
  - backend/src/shared/entities/mantenimiento-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-mantenimientos]
terminos: [mantenimiento, deposito, mantenimientos, estado, proceso, finalizado]
---

# MantenimientoDeposito

Mantenimiento de un elemento (seccion 14 del pedido): a diferencia del estado generico ESTADO_ELEMENTO_DEPOSITO='En mantenimiento', esta tabla guarda los campos estructurados que pedia el negocio -- taller/responsable, fecha estimada de salida, fecha real, costo -- en vez de dejarlos sueltos en observacion. `movimientoIngresoId`/`movimientoSalidaId` enlazan con el historial real de deposito.movimientos (el mantenimiento nunca mueve la tenencia por fuera de ese mecanismo).

- **Tabla:** [[table--deposito-mantenimientos|deposito.mantenimientos]]
- **Columnas mapeadas:** 18

## Estados y enumeraciones

- `EstadoMantenimientoDeposito`: `EN_PROCESO` · `FINALIZADO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** MantenimientosController
- **Servicios:** MantenimientosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/mantenimiento-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-mantenimientos|deposito.mantenimientos]]

## Referenciado por

- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
