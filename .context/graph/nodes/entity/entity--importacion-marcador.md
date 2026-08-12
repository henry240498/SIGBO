---
id: entity--importacion-marcador
tipo: ENTITY
nombre: ImportacionMarcador
nivel: L1
dominio: asistencia
resumen: "Cabecera de una importacion del Excel del marcador digital. El hash del archivo garantiza idempotencia real: subir el mismo archivo dos veces no genera duplicados (seccion 14 del pedido de Asistencia)."
tabla: operaciones.importaciones_marcador
archivos:
  - backend/src/shared/entities/importacion-marcador.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-importaciones-marcador]
terminos: [importacion, marcador, importaciones, operaciones, estado, analizado, confirmado, cancelado]
---

# ImportacionMarcador

Cabecera de una importacion del Excel del marcador digital. El hash del archivo garantiza idempotencia real: subir el mismo archivo dos veces no genera duplicados (seccion 14 del pedido de Asistencia).

- **Tabla:** [[table--operaciones-importaciones-marcador|operaciones.importaciones_marcador]]
- **Columnas mapeadas:** 14

## Estados y enumeraciones

- `EstadoImportacionMarcador`: `ANALIZADO` · `CONFIRMADO` · `CANCELADO`

## Archivos

- `backend/src/shared/entities/importacion-marcador.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-importaciones-marcador|operaciones.importaciones_marcador]]

## Referenciado por

- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[workflow--importacion-marcador|Importacion de marcaciones desde el marcador digital]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
