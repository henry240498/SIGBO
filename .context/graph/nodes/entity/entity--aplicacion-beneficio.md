---
id: entity--aplicacion-beneficio
tipo: ENTITY
nombre: AplicacionBeneficio
nivel: L1
dominio: finanzas
resumen: "Rastro auditado de cada vez que se aplico un BeneficioSocio (seccion 12-13 del pedido: la aplicacion del descuento debe quedar registrada, nunca ser un calculo invisible)."
tabla: finanzas.aplicaciones_beneficio
archivos:
  - backend/src/shared/entities/aplicacion-beneficio.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-aplicaciones-beneficio]
terminos: [aplicacion, beneficio, aplicaciones, finanzas]
---

# AplicacionBeneficio

Rastro auditado de cada vez que se aplico un BeneficioSocio (seccion 12-13 del pedido: la aplicacion del descuento debe quedar registrada, nunca ser un calculo invisible).

- **Tabla:** [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** BeneficiosSociosController
- **Servicios:** BeneficiosSociosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/aplicacion-beneficio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]]

## Referenciado por

- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
