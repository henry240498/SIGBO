---
id: entity--tipo-bombero
tipo: ENTITY
nombre: TipoBombero
nivel: L1
dominio: personal
resumen: Entidad TipoBombero, persistida en personal.tipos_bombero.
tabla: personal.tipos_bombero
archivos:
  - backend/src/shared/entities/tipo-bombero.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-tipos-bombero]
terminos: [tipo, bombero, tipos, personal]
---

# TipoBombero

Entidad TipoBombero, persistida en personal.tipos_bombero.

- **Tabla:** [[table--personal-tipos-bombero|personal.tipos_bombero]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/registro`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos/[id]`, `/dashboard/documentos/plantillas`, `/dashboard/equipos/[id]`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/socios-protectores`, `/dashboard/guardias/[id]`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/organizacion/tipos-bombero`, `/dashboard/personal`, `/dashboard/personal/[id]`
- **Endpoints:** TiposBomberoController
- **Servicios:** IaToolsService, TiposBomberoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/tipo-bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-tipos-bombero|personal.tipos_bombero]]

## Referenciado por

- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--personal-tipos-bombero|TiposBomberoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
