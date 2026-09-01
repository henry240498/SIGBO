---
id: screen--dashboard-academia
tipo: SCREEN
nombre: /dashboard/academia
nivel: L1
dominio: academia
resumen: Pantalla /dashboard/academia.
ruta: /dashboard/academia
capa: frontend
permisos: [academia:crear_curso]
archivos:
  - frontend/src/app/dashboard/academia/page.tsx
edges:
  - [belongs_to, domain--academia]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-academia]
  - [uses, component--front-aviso]
terminos: [academia, crear, curso]
---

# /dashboard/academia

Pantalla /dashboard/academia.

- **Ruta:** `/dashboard/academia`
- **Permisos referenciados:** `academia:crear_curso`

## Archivos

- `frontend/src/app/dashboard/academia/page.tsx`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-academia|academia]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
