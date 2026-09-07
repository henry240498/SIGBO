---
id: service--documentos-dashboard-documentos
tipo: SERVICE
nombre: DashboardDocumentosService
nivel: L2
dominio: documentos
resumen: Indicadores de la pantalla principal de Documentos (seccion 36 del pedido). Siempre calculados en el momento, nunca cacheados.
capa: backend
archivos:
  - backend/src/modules/documentos/dashboard-documentos.service.ts
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--modulo-documentos]
  - [uses, entity--documento]
  - [reads, table--documentos-documentos-institucionales]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [documentos, documento, parametro]
---

# DashboardDocumentosService

Indicadores de la pantalla principal de Documentos (seccion 36 del pedido). Siempre calculados en el momento, nunca cacheados.


## Metodos

`indicadores()`

## Archivos

- `backend/src/modules/documentos/dashboard-documentos.service.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--modulo-documentos|documentos (modulo NestJS)]]
- `uses` → [[entity--documento|Documento]]
- `reads` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--documentos-dashboard-documentos|DashboardDocumentosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
