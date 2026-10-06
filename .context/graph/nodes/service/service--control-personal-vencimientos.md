---
id: service--control-personal-vencimientos
tipo: SERVICE
nombre: VencimientosService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de vencimientos (modulo control-personal).
capa: backend
archivos:
  - backend/src/modules/control-personal/vencimientos.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-control-personal]
  - [uses, service--seguridad-auditoria]
terminos: [vencimientos, control, personal]
---

# VencimientosService

Logica de negocio de vencimientos (modulo control-personal).


## Metodos

`crearAptitud()` · `actualizarAptitud()` · `categoriaDe()` · `listarAptitudes()` · `vencimientos()`

## Archivos

- `backend/src/modules/control-personal/vencimientos.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-control-personal|control-personal (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--control-personal-avisos-vencimiento|AvisosVencimientoService]] `uses` →
- [[api--control-personal-control-personal|ControlPersonalController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
