---
id: service--guardias-pernoctes
tipo: SERVICE
nombre: PernoctesService
nivel: L2
dominio: guardias
resumen: Logica de negocio de pernoctes (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/pernoctes.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--pernocte]
  - [reads, table--operaciones-pernoctes]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, service--seguridad-auditoria]
terminos: [pernoctes, guardias, pernocte, bombero]
---

# PernoctesService

Logica de negocio de pernoctes (modulo guardias).


## Metodos

`listar()` · `crear()` · `registrarSalida()`

## Archivos

- `backend/src/modules/guardias/pernoctes.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--pernocte|Pernocte]]
- `reads` → [[table--operaciones-pernoctes|operaciones.pernoctes]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-pernoctes|PernoctesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
