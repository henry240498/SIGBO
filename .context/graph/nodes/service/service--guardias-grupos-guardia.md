---
id: service--guardias-grupos-guardia
tipo: SERVICE
nombre: GruposGuardiaService
nivel: L2
dominio: guardias
resumen: Logica de negocio de grupos guardia (modulo guardias).
capa: backend
archivos:
  - backend/src/modules/guardias/grupos-guardia.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--grupo-guardia]
  - [reads, table--operaciones-grupos-guardia]
  - [uses, entity--grupo-guardia-miembro]
  - [reads, table--operaciones-grupos-guardia-miembros]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, service--guardias-elegibilidad]
  - [uses, service--seguridad-auditoria]
terminos: [grupos, guardia, guardias, grupo, miembro, bombero]
---

# GruposGuardiaService

Logica de negocio de grupos guardia (modulo guardias).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `listarMiembros()` · `agregarMiembro()` · `quitarMiembro()`

## Archivos

- `backend/src/modules/guardias/grupos-guardia.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--grupo-guardia|GrupoGuardia]]
- `reads` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- `uses` → [[entity--grupo-guardia-miembro|GrupoGuardiaMiembro]]
- `reads` → [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[service--guardias-elegibilidad|ElegibilidadService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-grupos-guardia|GruposGuardiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
