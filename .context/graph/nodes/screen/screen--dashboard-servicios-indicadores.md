---
id: screen--dashboard-servicios-indicadores
tipo: SCREEN
nombre: /dashboard/servicios/indicadores
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/indicadores.
ruta: /dashboard/servicios/indicadores
capa: frontend
archivos:
  - frontend/src/app/dashboard/servicios/indicadores/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-indicadores]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [servicios, indicadores]
---

# /dashboard/servicios/indicadores

Pantalla /dashboard/servicios/indicadores.

- **Ruta:** `/dashboard/servicios/indicadores`

## Archivos

- `frontend/src/app/dashboard/servicios/indicadores/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-indicadores|indicadores]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
