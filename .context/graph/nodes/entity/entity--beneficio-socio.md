---
id: entity--beneficio-socio
tipo: ENTITY
nombre: BeneficioSocio
nivel: L1
dominio: finanzas
resumen: "Catalogo de descuentos/beneficios para Socios Protectores. Aplica a TODO socio con estado activo (no hay asignacion 1 a 1 socio<->beneficio -- el pedido no la exige). El calculo se registra siempre en AplicacionBeneficio y NUNCA modifica el precio base de la actividad/servicio relacionado."
tabla: finanzas.beneficios_socios
archivos:
  - backend/src/shared/entities/beneficio-socio.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-beneficios-socios]
terminos: [beneficio, socio, beneficios, socios, finanzas, ambito, academia, servicios, general, estado, activo, inactivo]
---

# BeneficioSocio

Catalogo de descuentos/beneficios para Socios Protectores. Aplica a TODO socio con estado activo (no hay asignacion 1 a 1 socio<->beneficio -- el pedido no la exige). El calculo se registra siempre en AplicacionBeneficio y NUNCA modifica el precio base de la actividad/servicio relacionado.

- **Tabla:** [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]]
- **Columnas mapeadas:** 15

## Estados y enumeraciones

- `AmbitoBeneficioSocio`: `ACADEMIA` · `SERVICIOS` · `GENERAL`
- `EstadoBeneficioSocio`: `ACTIVO` · `INACTIVO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** BeneficiosSociosController
- **Servicios:** BeneficiosSociosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/beneficio-socio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]]

## Referenciado por

- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
