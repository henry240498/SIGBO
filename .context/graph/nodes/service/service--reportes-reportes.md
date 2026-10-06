---
id: service--reportes-reportes
tipo: SERVICE
nombre: ReportesService
nivel: L2
dominio: seguridad
resumen: "Guarda cada reporte como un archivo de texto plano en `backend/storage/reportes` (o en REPORTES_DIR). El nombre lo arma el servidor: nada de lo que escribe la persona llega a la ruta del archivo."
capa: backend
archivos:
  - backend/src/modules/reportes/reportes.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-reportes]
  - [uses, service--seguridad-auditoria]
terminos: [reportes]
---

# ReportesService

Guarda cada reporte como un archivo de texto plano en `backend/storage/reportes` (o en REPORTES_DIR). El nombre lo arma el servidor: nada de lo que escribe la persona llega a la ruta del archivo.


## Metodos

`if()` · `carpeta()` · `crear()`

## Archivos

- `backend/src/modules/reportes/reportes.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-reportes|reportes (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--reportes-reportes|ReportesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
