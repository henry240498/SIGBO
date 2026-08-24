---
id: entity--socio-protector
tipo: ENTITY
nombre: SocioProtector
nivel: L1
dominio: finanzas
resumen: "Socio Protector: persona fisica, juridica, o un bombero existente (vinculo explicito por bomberoId -- nunca se duplica el registro de Personal). El codigo visible/editable (SC001) es independiente del PK interno; sus cambios se auditan en SociosHistorialCodigo."
tabla: finanzas.socios_protectores
archivos:
  - backend/src/shared/entities/socio-protector.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-socios-protectores]
terminos: [socio, protector, socios, protectores, finanzas, tipo, persona, fisica, juridica]
---

# SocioProtector

Socio Protector: persona fisica, juridica, o un bombero existente (vinculo explicito por bomberoId -- nunca se duplica el registro de Personal). El codigo visible/editable (SC001) es independiente del PK interno; sus cambios se auditan en SociosHistorialCodigo.

- **Tabla:** [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- **Columnas mapeadas:** 25

## Estados y enumeraciones

- `TipoPersonaSocio`: `FISICA` · `JURIDICA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** AcuerdosAporteController, AportesController, BeneficiosSociosController, DashboardFinanzasController, InscripcionesAcademiaController, SociosProtectoresController
- **Servicios:** AcuerdosAporteService, AportesService, BeneficiosSociosService, DashboardFinanzasService, InscripcionesAcademiaService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/socio-protector.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]

## Referenciado por

- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `uses` →
- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
