---
id: component--modulo-salud
tipo: COMPONENT
nombre: salud (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de salud.
capa: backend
archivos:
  - backend/src/modules/salud/salud.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [salud, modulo]
---

# salud (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de salud.


## Archivos

- `backend/src/modules/salud/salud.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
