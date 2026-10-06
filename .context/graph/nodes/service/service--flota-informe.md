---
id: service--flota-informe
tipo: SERVICE
nombre: InformeService
nivel: L2
dominio: vehiculos
resumen: Logica de negocio de informe (modulo flota).
capa: backend
archivos:
  - backend/src/modules/flota/informe.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-flota]
  - [uses, service--seguridad-auditoria]
terminos: [informe, flota]
---

# InformeService

Logica de negocio de informe (modulo flota).


## Metodos

`reunirDatos()` · `generarPdf()`

## Archivos

- `backend/src/modules/flota/informe.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-flota|flota (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--flota-flota|FlotaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
