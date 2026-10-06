---
id: service--campo-adjuntos
tipo: SERVICE
nombre: AdjuntosService
nivel: L2
dominio: servicios
resumen: Logica de negocio de adjuntos (modulo campo).
capa: backend
archivos:
  - backend/src/modules/campo/adjuntos.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-campo]
  - [uses, service--seguridad-auditoria]
terminos: [adjuntos, campo]
---

# AdjuntosService

Logica de negocio de adjuntos (modulo campo).


## Metodos

`subir()` · `listar()` · `archivo()`

## Archivos

- `backend/src/modules/campo/adjuntos.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-campo|campo (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--campo-campo|CampoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
