---
id: service--flota-flota
tipo: SERVICE
nombre: FlotaService
nivel: L2
dominio: vehiculos
resumen: Logica de negocio de flota (modulo flota).
capa: backend
archivos:
  - backend/src/modules/flota/flota.service.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [uses, component--modulo-flota]
  - [uses, service--seguridad-auditoria]
terminos: [flota]
---

# FlotaService

Logica de negocio de flota (modulo flota).


## Metodos

`tablero()` · `reportarPosicion()` · `movilesParaReporte()` · `posiciones()` · `vencimientos()` · `datosPendientes()` · `serviciosAbiertos()` · `historialMovil()` · `listarDespachos()` · `despachar()` · `avanzar()` · `cancelar()` · `reponerEnCuartel()`

## Archivos

- `backend/src/modules/flota/flota.service.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `uses` → [[component--modulo-flota|flota (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--flota-flota|FlotaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
