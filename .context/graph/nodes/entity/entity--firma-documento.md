---
id: entity--firma-documento
tipo: ENTITY
nombre: FirmaDocumento
nivel: L1
dominio: documentos
resumen: "Un firmante requerido de un documento (secciones 9-10 del pedido). Exactamente uno de cargoFirmanteId/bomberoFirmanteId (CK_docf_firmante en SQL): por cargo se resuelve automaticamente quien lo ocupa hoy (resolverFirmante), por bombero es una persona puntual fija. Firma parcial: si un documento requiere 2 firmantes y solo uno esta autorizado para firma digital, esa fila queda `firmado=1` con `firmaUrl` cargada y la otra permanece `firmado=0` -- el generador de PDF/DOCX deja el renglon en blanco para esa segunda firma."
tabla: documentos.firmas_documento
archivos:
  - backend/src/shared/entities/firma-documento.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-firmas-documento]
terminos: [firma, documento, firmas, documentos]
---

# FirmaDocumento

Un firmante requerido de un documento (secciones 9-10 del pedido). Exactamente uno de cargoFirmanteId/bomberoFirmanteId (CK_docf_firmante en SQL): por cargo se resuelve automaticamente quien lo ocupa hoy (resolverFirmante), por bombero es una persona puntual fija. Firma parcial: si un documento requiere 2 firmantes y solo uno esta autorizado para firma digital, esa fila queda `firmado=1` con `firmaUrl` cargada y la otra permanece `firmado=0` -- el generador de PDF/DOCX deja el renglon en blanco para esa segunda firma.

- **Tabla:** [[table--documentos-firmas-documento|documentos.firmas_documento]]
- **Columnas mapeadas:** 10

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** FirmasDocumentoController, PlantillasController
- **Servicios:** FirmasDocumentoService, PlantillasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/firma-documento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-firmas-documento|documentos.firmas_documento]]

## Referenciado por

- [[service--documentos-firmas-documento|FirmasDocumentoService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
