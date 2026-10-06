---
id: component--modulo-pantallas
tipo: COMPONENT
nombre: pantallas (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de pantallas.
capa: backend
archivos:
  - backend/src/modules/pantallas/pantallas.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [pantallas, modulo]
---

# pantallas (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de pantallas.


## Archivos

- `backend/src/modules/pantallas/pantallas.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--pantallas-navegacion|NavegacionService]] `uses` →
- [[service--pantallas-pantallas|PantallasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
