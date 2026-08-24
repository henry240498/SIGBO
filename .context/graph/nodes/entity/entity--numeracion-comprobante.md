---
id: entity--numeracion-comprobante
tipo: ENTITY
nombre: NumeracionComprobante
nivel: L1
dominio: finanzas
resumen: "Configuracion parametrizable de numeracion de comprobantes (establecimiento/punto de expedicion/serie/timbrado/vigencia, seccion 18 del pedido). Mismo espiritu que documentos.NumeracionDocumento (contador por combinacion), con los campos propios de la numeracion fiscal paraguaya. Solo se consume al emitir una Factura con origen=SIGBO (preparado, no forzado)."
tabla: finanzas.numeraciones_comprobantes
archivos:
  - backend/src/shared/entities/numeracion-comprobante.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-numeraciones-comprobantes]
terminos: [numeracion, comprobante, numeraciones, comprobantes, finanzas, estado, activa, inactiva, agotada]
---

# NumeracionComprobante

Configuracion parametrizable de numeracion de comprobantes (establecimiento/punto de expedicion/serie/timbrado/vigencia, seccion 18 del pedido). Mismo espiritu que documentos.NumeracionDocumento (contador por combinacion), con los campos propios de la numeracion fiscal paraguaya. Solo se consume al emitir una Factura con origen=SIGBO (preparado, no forzado).

- **Tabla:** [[table--finanzas-numeraciones-comprobantes|finanzas.numeraciones_comprobantes]]
- **Columnas mapeadas:** 13

## Estados y enumeraciones

- `EstadoNumeracionComprobante`: `ACTIVA` · `INACTIVA` · `AGOTADA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** NumeracionesComprobantesController
- **Servicios:** NumeracionesComprobantesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/numeracion-comprobante.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-numeraciones-comprobantes|finanzas.numeraciones_comprobantes]]

## Referenciado por

- [[service--finanzas-numeraciones-comprobantes|NumeracionesComprobantesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
