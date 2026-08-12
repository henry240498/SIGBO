---
id: entity--importacion-marcador-fila
tipo: ENTITY
nombre: ImportacionMarcadorFila
nivel: L1
dominio: asistencia
resumen: Una fila cruda del Excel analizada durante la previsualizacion de una importacion, antes de confirmarse (o no) como marcacion real. Conserva el dato original completo para auditoria (seccion 16 del pedido).
tabla: operaciones.importaciones_marcador_filas
archivos:
  - backend/src/shared/entities/importacion-marcador-fila.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-importaciones-marcador-filas]
terminos: [importacion, marcador, fila, importaciones, filas, operaciones, estado, reconocido, identificado, duplicado, importado, inconsistente]
---

# ImportacionMarcadorFila

Una fila cruda del Excel analizada durante la previsualizacion de una importacion, antes de confirmarse (o no) como marcacion real. Conserva el dato original completo para auditoria (seccion 16 del pedido).

- **Tabla:** [[table--operaciones-importaciones-marcador-filas|operaciones.importaciones_marcador_filas]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `EstadoFilaImportacion`: `RECONOCIDO` · `NO_IDENTIFICADO` · `DUPLICADO` · `YA_IMPORTADO` · `INCONSISTENTE`

## Archivos

- `backend/src/shared/entities/importacion-marcador-fila.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-importaciones-marcador-filas|operaciones.importaciones_marcador_filas]]

## Referenciado por

- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[workflow--importacion-marcador|Importacion de marcaciones desde el marcador digital]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
