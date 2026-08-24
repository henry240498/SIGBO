---
id: service--operaciones-importaciones
tipo: SERVICE
nombre: ImportacionesService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de importaciones (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/importaciones.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--importacion-marcador]
  - [reads, table--operaciones-importaciones-marcador]
  - [uses, entity--importacion-marcador-fila]
  - [reads, table--operaciones-importaciones-marcador-filas]
  - [uses, entity--marcacion-asistencia]
  - [reads, table--operaciones-marcaciones-asistencia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, service--seguridad-auditoria]
terminos: [importaciones, operaciones, importacion, marcador, fila, marcacion, asistencia, bombero]
---

# ImportacionesService

Logica de negocio de importaciones (modulo operaciones).


## Metodos

`if()` · `for()` · `for()` · `if()` · `for()` · `if()` · `if()` · `if()` · `analizar()` · `findOne()` · `historial()` · `listarFilas()` · `confirmar()` · `cancelar()`

## Archivos

- `backend/src/modules/operaciones/importaciones.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--importacion-marcador|ImportacionMarcador]]
- `reads` → [[table--operaciones-importaciones-marcador|operaciones.importaciones_marcador]]
- `uses` → [[entity--importacion-marcador-fila|ImportacionMarcadorFila]]
- `reads` → [[table--operaciones-importaciones-marcador-filas|operaciones.importaciones_marcador_filas]]
- `uses` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `reads` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--operaciones-importaciones|ImportacionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
