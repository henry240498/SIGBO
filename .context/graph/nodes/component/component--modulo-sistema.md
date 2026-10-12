---
id: component--modulo-sistema
tipo: COMPONENT
nombre: sistema (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de sistema.
capa: backend
archivos:
  - backend/src/modules/sistema/sistema.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [sistema, modulo]
---

# sistema (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de sistema.


## Archivos

- `backend/src/modules/sistema/sistema.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--sistema-respaldos|RespaldosService]] `uses` →
- [[service--sistema-sistema|SistemaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
