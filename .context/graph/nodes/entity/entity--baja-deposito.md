---
id: entity--baja-deposito
tipo: ENTITY
nombre: BajaDeposito
nivel: L1
dominio: deposito
resumen: "Baja de un elemento (seccion 13 del pedido): nunca elimina el registro fisicamente -- el elemento pasa a estado BAJA (tenencia.estadoElementoId) y permanece en el historial. `motivoBajaId` referencia organizacion.parametros (tipo MOTIVO_BAJA_DEPOSITO)."
tabla: deposito.bajas
archivos:
  - backend/src/shared/entities/baja-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-bajas]
terminos: [baja, deposito, bajas]
---

# BajaDeposito

Baja de un elemento (seccion 13 del pedido): nunca elimina el registro fisicamente -- el elemento pasa a estado BAJA (tenencia.estadoElementoId) y permanece en el historial. `motivoBajaId` referencia organizacion.parametros (tipo MOTIVO_BAJA_DEPOSITO).

- **Tabla:** [[table--deposito-bajas|deposito.bajas]]
- **Columnas mapeadas:** 13

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** BajasController
- **Servicios:** BajasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/baja-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-bajas|deposito.bajas]]

## Referenciado por

- [[service--deposito-bajas|BajasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
