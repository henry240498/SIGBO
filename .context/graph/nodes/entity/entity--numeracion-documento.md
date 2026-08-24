---
id: entity--numeracion-documento
tipo: ENTITY
nombre: NumeracionDocumento
nivel: L1
dominio: documentos
resumen: "Contador de numeracion documental por tipo+anio(+institucion) -- seccion 7 del pedido. No asume una numeracion unica global: cada combinacion tipo+anio tiene su propio correlativo (Resolucion N.º 01/2026, Orden de Servicio N.º 01/2026, en paralelo). `anio`/`ultimoNumero` son la posicion VIGENTE (\"anio actual\"/\"numero actual\" del pedido) -- se siguen leyendo igual que antes de la migracion 069. Los campos `*Desde`/`*Hasta` describen el rango declarado para este numerador (informativo/de control, ej. \"esta numeracion arranca en 2026-01 desde el 01\"); `fechaVigencia*` determina si esta configuracion aplica \"hoy\"."
tabla: documentos.numeraciones
archivos:
  - backend/src/shared/entities/numeracion-documento.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-numeraciones]
terminos: [numeracion, documento, numeraciones, documentos]
---

# NumeracionDocumento

Contador de numeracion documental por tipo+anio(+institucion) -- seccion 7 del pedido. No asume una numeracion unica global: cada combinacion tipo+anio tiene su propio correlativo (Resolucion N.º 01/2026, Orden de Servicio N.º 01/2026, en paralelo). `anio`/`ultimoNumero` son la posicion VIGENTE ("anio actual"/"numero actual" del pedido) -- se siguen leyendo igual que antes de la migracion 069. Los campos `*Desde`/`*Hasta` describen el rango declarado para este numerador (informativo/de control, ej. "esta numeracion arranca en 2026-01 desde el 01"); `fechaVigencia*` determina si esta configuracion aplica "hoy".

- **Tabla:** [[table--documentos-numeraciones|documentos.numeraciones]]
- **Columnas mapeadas:** 17

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** DocumentosController
- **Servicios:** DocumentosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/numeracion-documento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-numeraciones|documentos.numeraciones]]

## Referenciado por

- [[service--documentos-documentos|DocumentosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
