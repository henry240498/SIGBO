---
id: screen--dashboard-academia-cursos-externos
tipo: SCREEN
nombre: /dashboard/academia/cursos-externos
nivel: L1
dominio: academia
resumen: Pantalla /dashboard/academia/cursos-externos.
ruta: /dashboard/academia/cursos-externos
capa: frontend
permisos: [academia:configurar]
archivos:
  - frontend/src/app/dashboard/academia/cursos-externos/page.tsx
edges:
  - [belongs_to, domain--academia]
  - [uses, component--front-api]
  - [uses, component--front-academia]
  - [uses, component--front-aviso]
terminos: [academia, cursos, externos, configurar]
---

# /dashboard/academia/cursos-externos

Pantalla /dashboard/academia/cursos-externos.

- **Ruta:** `/dashboard/academia/cursos-externos`
- **Permisos referenciados:** `academia:configurar`

## Archivos

- `frontend/src/app/dashboard/academia/cursos-externos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-academia|academia]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
