---
id: entity--prestamo-deposito
tipo: ENTITY
nombre: PrestamoDeposito
nivel: L1
dominio: deposito
resumen: "Prestamo amplio de Deposito (seccion 7 del pedido): a personal, a otra institucion, para un servicio, capacitacion, mantenimiento u otro motivo. Distinto de equipos.prestamos_equipos (bombero-only, un solo equipo por fila, sin ubicacion) -- ese mecanismo se deja intacto para no romper las pantallas que ya lo usan; este cubre multi-item, cantidad, y cualquier tipo de destinatario."
tabla: deposito.prestamos
archivos:
  - backend/src/shared/entities/prestamo-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-prestamos]
terminos: [prestamo, deposito, prestamos, estado, activo, devuelto, parcial, extraviado]
---

# PrestamoDeposito

Prestamo amplio de Deposito (seccion 7 del pedido): a personal, a otra institucion, para un servicio, capacitacion, mantenimiento u otro motivo. Distinto de equipos.prestamos_equipos (bombero-only, un solo equipo por fila, sin ubicacion) -- ese mecanismo se deja intacto para no romper las pantallas que ya lo usan; este cubre multi-item, cantidad, y cualquier tipo de destinatario.

- **Tabla:** [[table--deposito-prestamos|deposito.prestamos]]
- **Columnas mapeadas:** 12

## Estados y enumeraciones

- `EstadoPrestamoDeposito`: `ACTIVO` · `DEVUELTO_PARCIAL` · `DEVUELTO` · `EXTRAVIADO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** ConsultasDepositoController, PrestamosController
- **Servicios:** ConsultasDepositoService, PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/prestamo-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-prestamos|deposito.prestamos]]

## Referenciado por

- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[service--deposito-prestamos|PrestamosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
