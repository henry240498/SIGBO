---
id: screen--dashboard-seguridad-inteligencia-artificial-propuestas
tipo: SCREEN
nombre: /dashboard/seguridad/inteligencia-artificial/propuestas
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/inteligencia-artificial/propuestas.
ruta: /dashboard/seguridad/inteligencia-artificial/propuestas
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/inteligencia-artificial/propuestas/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-ia]
  - [uses, component--front-aviso]
terminos: [seguridad, inteligencia, artificial, propuestas]
---

# /dashboard/seguridad/inteligencia-artificial/propuestas

Pantalla /dashboard/seguridad/inteligencia-artificial/propuestas.

- **Ruta:** `/dashboard/seguridad/inteligencia-artificial/propuestas`

## Archivos

- `frontend/src/app/dashboard/seguridad/inteligencia-artificial/propuestas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-ia|ia]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
