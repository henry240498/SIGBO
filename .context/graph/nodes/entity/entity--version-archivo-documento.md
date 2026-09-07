---
id: entity--version-archivo-documento
tipo: ENTITY
nombre: VersionArchivoDocumento
nivel: L1
dominio: documentos
resumen: "Historico append-only de cada archivo que fue el \"vigente\" de un documento (seccion 12): al cargar una version nueva, el archivo que estaba vigente se snapshotea aca antes de reemplazarse en Documento.archivoUrl -- nunca se pierde, consultable si el usuario tiene permiso."
tabla: documentos.versiones_archivo
archivos:
  - backend/src/shared/entities/version-archivo-documento.entity.ts
edges:
  - [belongs_to, domain--documentos]
  - [persisted_in, table--documentos-versiones-archivo]
terminos: [version, archivo, documento, versiones, documentos]
---

# VersionArchivoDocumento

Historico append-only de cada archivo que fue el "vigente" de un documento (seccion 12): al cargar una version nueva, el archivo que estaba vigente se snapshotea aca antes de reemplazarse en Documento.archivoUrl -- nunca se pierde, consultable si el usuario tiene permiso.

- **Tabla:** [[table--documentos-versiones-archivo|documentos.versiones_archivo]]
- **Columnas mapeadas:** 8

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/organizacion/documentos`
- **Endpoints:** DocumentosController
- **Servicios:** DocumentosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/version-archivo-documento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `persisted_in` → [[table--documentos-versiones-archivo|documentos.versiones_archivo]]

## Referenciado por

- [[service--documentos-documentos|DocumentosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
