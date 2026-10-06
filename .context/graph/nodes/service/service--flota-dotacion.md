---
id: service--flota-dotacion
tipo: SERVICE
nombre: DotacionService
nivel: L2
dominio: vehiculos
resumen: Logica de negocio de dotacion (modulo flota).
capa: backend
archivos:
  - backend/src/modules/flota/dotacion.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-flota]
  - [uses, service--seguridad-auditoria]
terminos: [dotacion, flota]
---

# DotacionService

Logica de negocio de dotacion (modulo flota).


## Metodos

`if()` · `listar()` · `crear()` · `actualizar()` · `registrarControl()` · `faltantes()` · `bitacora()`

## Archivos

- `backend/src/modules/flota/dotacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-flota|flota (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--flota-flota|FlotaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
