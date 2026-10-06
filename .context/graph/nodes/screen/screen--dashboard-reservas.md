---
id: screen--dashboard-reservas
tipo: SCREEN
nombre: /dashboard/reservas
nivel: L1
dominio: reservas
resumen: Pantalla /dashboard/reservas.
ruta: /dashboard/reservas
capa: frontend
permisos: [reservas:solicitar, reservas:decidir]
archivos:
  - frontend/src/app/dashboard/reservas/page.tsx
edges:
  - [belongs_to, domain--reservas]
  - [uses, component--front-api]
  - [uses, component--front-reservas]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-inputprovider]
terminos: [reservas, solicitar, decidir]
---

# /dashboard/reservas

Pantalla /dashboard/reservas.

- **Ruta:** `/dashboard/reservas`
- **Permisos referenciados:** `reservas:solicitar`, `reservas:decidir`

## Archivos

- `frontend/src/app/dashboard/reservas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--reservas|Reservas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-reservas|reservas]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-inputprovider|InputProvider]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
