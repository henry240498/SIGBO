---
id: screen--denuncias
tipo: SCREEN
nombre: /denuncias
nivel: L1
dominio: denuncias
resumen: Pantalla /denuncias.
ruta: /denuncias
capa: frontend
archivos:
  - frontend/src/app/denuncias/page.tsx
edges:
  - [belongs_to, domain--denuncias]
  - [uses, component--front-api]
terminos: [denuncias]
---

# /denuncias

Pantalla /denuncias.

- **Ruta:** `/denuncias`

## Archivos

- `frontend/src/app/denuncias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `uses` → [[component--front-api|api]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
