---
id: screen--dashboard-inteligencia
tipo: SCREEN
nombre: /dashboard/inteligencia
nivel: L1
dominio: inteligencia
resumen: Pantalla /dashboard/inteligencia.
ruta: /dashboard/inteligencia
capa: frontend
archivos:
  - frontend/src/app/dashboard/inteligencia/page.tsx
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--front-api]
  - [uses, component--front-ia]
terminos: [inteligencia]
---

# /dashboard/inteligencia

Pantalla /dashboard/inteligencia.

- **Ruta:** `/dashboard/inteligencia`

## Archivos

- `frontend/src/app/dashboard/inteligencia/page.tsx`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-ia|ia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
