---
id: screen--fichar
tipo: SCREEN
nombre: /fichar
nivel: L1
dominio: seguridad
resumen: Pantalla /fichar.
ruta: /fichar
capa: frontend
archivos:
  - frontend/src/app/fichar/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-control-personal]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [fichar]
---

# /fichar

Pantalla /fichar.

- **Ruta:** `/fichar`

## Archivos

- `frontend/src/app/fichar/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-control-personal|control-personal]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
