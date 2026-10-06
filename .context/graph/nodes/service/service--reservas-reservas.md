---
id: service--reservas-reservas
tipo: SERVICE
nombre: ReservasService
nivel: L2
dominio: reservas
resumen: Logica de negocio de reservas (modulo reservas).
capa: backend
archivos:
  - backend/src/modules/reservas/reservas.service.ts
edges:
  - [belongs_to, domain--reservas]
  - [uses, component--modulo-reservas]
  - [uses, service--seguridad-auditoria]
terminos: [reservas]
---

# ReservasService

Logica de negocio de reservas (modulo reservas).


## Metodos

`listarInstalaciones()` · `crearInstalacion()` · `actualizarInstalacion()` · `solicitar()` · `decidir()` · `cancelar()` · `listar()`

## Archivos

- `backend/src/modules/reservas/reservas.service.ts`

## Relaciones

- `belongs_to` → [[domain--reservas|Reservas]]
- `uses` → [[component--modulo-reservas|reservas (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--reservas-reservas|ReservasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
