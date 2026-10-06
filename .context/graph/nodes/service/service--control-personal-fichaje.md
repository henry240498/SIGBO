---
id: service--control-personal-fichaje
tipo: SERVICE
nombre: FichajeService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de fichaje (modulo control-personal).
capa: backend
archivos:
  - backend/src/modules/control-personal/fichaje.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-control-personal]
  - [uses, service--seguridad-auditoria]
terminos: [fichaje, control, personal]
---

# FichajeService

Logica de negocio de fichaje (modulo control-personal).


## Metodos

`if()` · `crearPunto()` · `regenerarToken()` · `actualizarPunto()` · `listarPuntos()` · `escanear()` · `misFichajes()` · `deFecha()`

## Archivos

- `backend/src/modules/control-personal/fichaje.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-control-personal|control-personal (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--control-personal-control-personal|ControlPersonalController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
