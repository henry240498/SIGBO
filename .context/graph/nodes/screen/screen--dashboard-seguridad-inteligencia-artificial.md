---
id: screen--dashboard-seguridad-inteligencia-artificial
tipo: SCREEN
nombre: /dashboard/seguridad/inteligencia-artificial
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/inteligencia-artificial.
ruta: /dashboard/seguridad/inteligencia-artificial
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/inteligencia-artificial/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-ia]
  - [uses, component--front-cargando]
terminos: [seguridad, inteligencia, artificial]
---

# /dashboard/seguridad/inteligencia-artificial

Pantalla /dashboard/seguridad/inteligencia-artificial.

- **Ruta:** `/dashboard/seguridad/inteligencia-artificial`

## Archivos

- `frontend/src/app/dashboard/seguridad/inteligencia-artificial/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-ia|ia]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
