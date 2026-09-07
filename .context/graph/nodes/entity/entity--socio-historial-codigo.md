---
id: entity--socio-historial-codigo
tipo: ENTITY
nombre: SocioHistorialCodigo
nivel: L1
dominio: finanzas
resumen: "Historial de cambios del codigo visible de un Socio Protector (SC001 -> SC125 debe dejar rastro). Mismo shape que personal.historial_codigo para numeroBombero."
tabla: finanzas.socios_historial_codigo
archivos:
  - backend/src/shared/entities/socio-historial-codigo.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-socios-historial-codigo]
terminos: [socio, historial, codigo, socios, finanzas]
---

# SocioHistorialCodigo

Historial de cambios del codigo visible de un Socio Protector (SC001 -> SC125 debe dejar rastro). Mismo shape que personal.historial_codigo para numeroBombero.

- **Tabla:** [[table--finanzas-socios-historial-codigo|finanzas.socios_historial_codigo]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** SociosProtectoresController
- **Servicios:** SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/socio-historial-codigo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-socios-historial-codigo|finanzas.socios_historial_codigo]]

## Referenciado por

- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
