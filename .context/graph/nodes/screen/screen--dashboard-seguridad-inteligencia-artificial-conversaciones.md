---
id: screen--dashboard-seguridad-inteligencia-artificial-conversaciones
tipo: SCREEN
nombre: /dashboard/seguridad/inteligencia-artificial/conversaciones
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/inteligencia-artificial/conversaciones.
ruta: /dashboard/seguridad/inteligencia-artificial/conversaciones
capa: frontend
permisos: [inteligencia:eliminar_conversaciones]
archivos:
  - frontend/src/app/dashboard/seguridad/inteligencia-artificial/conversaciones/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-ia]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [seguridad, inteligencia, artificial, conversaciones, eliminar]
---

# /dashboard/seguridad/inteligencia-artificial/conversaciones

Pantalla /dashboard/seguridad/inteligencia-artificial/conversaciones.

- **Ruta:** `/dashboard/seguridad/inteligencia-artificial/conversaciones`
- **Permisos referenciados:** `inteligencia:eliminar_conversaciones`

## Archivos

- `frontend/src/app/dashboard/seguridad/inteligencia-artificial/conversaciones/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-ia|ia]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
