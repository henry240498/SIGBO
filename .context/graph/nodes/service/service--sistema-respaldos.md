---
id: service--sistema-respaldos
tipo: SERVICE
nombre: RespaldosService
nivel: L2
dominio: seguridad
resumen: "Respaldos (tarea programada existente) y migraciones: lectura y las dos operaciones seguras."
capa: backend
archivos:
  - backend/src/modules/sistema/respaldos.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-sistema]
  - [uses, service--seguridad-auditoria]
terminos: [respaldos, sistema]
---

# RespaldosService

Respaldos (tarea programada existente) y migraciones: lectura y las dos operaciones seguras.


## Metodos

`tareas()` · `respaldos()` · `respaldarAhora()` · `verificarRespaldo()` · `migraciones()`

## Archivos

- `backend/src/modules/sistema/respaldos.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-sistema|sistema (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--sistema-sistema|SistemaService]] `uses` →
- [[api--sistema-sistema|SistemaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
