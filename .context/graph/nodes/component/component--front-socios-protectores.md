---
id: component--front-socios-protectores
tipo: COMPONENT
nombre: socios-protectores
nivel: L2
resumen: "Helper de frontend \"socios-protectores\" (47 exportaciones, consume 19 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/socios-protectores.ts
edges:
  - [calls, api--finanzas-socios-protectores]
  - [calls, api--finanzas-socios-protectores]
  - [calls, api--finanzas-socios-protectores]
  - [calls, api--finanzas-acuerdos-aporte]
  - [calls, api--finanzas-acuerdos-aporte]
  - [calls, api--finanzas-acuerdos-aporte]
  - [calls, api--finanzas-aportes]
  - [calls, api--finanzas-aportes]
  - [calls, api--finanzas-aportes]
  - [calls, api--finanzas-beneficios-socios]
  - [calls, api--finanzas-beneficios-socios]
  - [calls, api--finanzas-beneficios-socios]
  - [calls, api--finanzas-beneficios-socios]
  - [calls, api--finanzas-facturas]
  - [calls, api--finanzas-facturas]
  - [calls, api--finanzas-facturas]
  - [calls, api--finanzas-notas-credito]
  - [calls, api--finanzas-notas-credito]
  - [calls, api--finanzas-numeraciones-comprobantes]
terminos: [socios, protectores, cargar, estados, socio, protector, periodicidades, aporte, medios, pago, finanzas, tipos, beneficio, motivos, nota, credito, tipo, persona, historial, codigo, estado, acuerdo, ambito, simulacion, origen, factura]
---

# socios-protectores

Helper de frontend "socios-protectores" (47 exportaciones, consume 19 endpoint(s)).


## Archivos

- `frontend/src/lib/socios-protectores.ts`

## Relaciones

- `calls` → [[api--finanzas-socios-protectores|SociosProtectoresController]]
- `calls` → [[api--finanzas-socios-protectores|SociosProtectoresController]]
- `calls` → [[api--finanzas-socios-protectores|SociosProtectoresController]]
- `calls` → [[api--finanzas-acuerdos-aporte|AcuerdosAporteController]]
- `calls` → [[api--finanzas-acuerdos-aporte|AcuerdosAporteController]]
- `calls` → [[api--finanzas-acuerdos-aporte|AcuerdosAporteController]]
- `calls` → [[api--finanzas-aportes|AportesController]]
- `calls` → [[api--finanzas-aportes|AportesController]]
- `calls` → [[api--finanzas-aportes|AportesController]]
- `calls` → [[api--finanzas-beneficios-socios|BeneficiosSociosController]]
- `calls` → [[api--finanzas-beneficios-socios|BeneficiosSociosController]]
- `calls` → [[api--finanzas-beneficios-socios|BeneficiosSociosController]]
- `calls` → [[api--finanzas-beneficios-socios|BeneficiosSociosController]]
- `calls` → [[api--finanzas-facturas|FacturasController]]
- `calls` → [[api--finanzas-facturas|FacturasController]]
- `calls` → [[api--finanzas-facturas|FacturasController]]
- `calls` → [[api--finanzas-notas-credito|NotasCreditoController]]
- `calls` → [[api--finanzas-notas-credito|NotasCreditoController]]
- `calls` → [[api--finanzas-numeraciones-comprobantes|NumeracionesComprobantesController]]

## Referenciado por

- [[screen--dashboard-finanzas-beneficios|/dashboard/finanzas/beneficios]] `uses` →
- [[screen--dashboard-finanzas-facturacion|/dashboard/finanzas/facturacion]] `uses` →
- [[screen--dashboard-finanzas-socios-protectores|/dashboard/finanzas/socios-protectores]] `uses` →
- [[screen--dashboard-finanzas-socios-protectores-id|/dashboard/finanzas/socios-protectores/[id]]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
