---
id: service--campo-ausencias
tipo: SERVICE
nombre: AusenciasService
nivel: L2
dominio: servicios
resumen: Logica de negocio de ausencias (modulo campo).
capa: backend
archivos:
  - backend/src/modules/campo/ausencias.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-campo]
  - [uses, service--seguridad-auditoria]
terminos: [ausencias, campo]
---

# AusenciasService

Logica de negocio de ausencias (modulo campo).


## Metodos

`solicitar()` · `decidir()` · `cancelar()` · `listar()` · `ausentesEl()`

## Archivos

- `backend/src/modules/campo/ausencias.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-campo|campo (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--campo-campo|CampoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
