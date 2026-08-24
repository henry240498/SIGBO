---
id: service--deposito-alertas-deposito
tipo: SERVICE
nombre: AlertasDepositoService
nivel: L2
dominio: deposito
resumen: "Consolida las 3 alertas del pedido (stock bajo -- seccion 16, vencimiento de lotes -- seccion 17, prestamo vencido -- seccion 7) en un solo lugar para el dashboard. Nunca actua sola -- solo informa/sugiere (seccion 16: \"no realizar compras automaticamente, solo generar alerta\")."
capa: backend
archivos:
  - backend/src/modules/deposito/alertas-deposito.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, service--deposito-articulos]
  - [uses, service--deposito-lotes-articulo]
  - [uses, service--deposito-prestamos]
terminos: [alertas, deposito]
---

# AlertasDepositoService

Consolida las 3 alertas del pedido (stock bajo -- seccion 16, vencimiento de lotes -- seccion 17, prestamo vencido -- seccion 7) en un solo lugar para el dashboard. Nunca actua sola -- solo informa/sugiere (seccion 16: "no realizar compras automaticamente, solo generar alerta").


## Metodos

`resumen()`

## Archivos

- `backend/src/modules/deposito/alertas-deposito.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[service--deposito-articulos|ArticulosService]]
- `uses` → [[service--deposito-lotes-articulo|LotesArticuloService]]
- `uses` → [[service--deposito-prestamos|PrestamosService]]

## Referenciado por

- [[service--deposito-dashboard-deposito|DashboardDepositoService]] `uses` →
- [[api--deposito-alertas-deposito|AlertasDepositoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
