---
id: screen--dashboard-seguridad-inteligencia-artificial-configuracion
tipo: SCREEN
nombre: /dashboard/seguridad/inteligencia-artificial/configuracion
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/inteligencia-artificial/configuracion.
ruta: /dashboard/seguridad/inteligencia-artificial/configuracion
capa: frontend
permisos: [inteligencia:desactivar, inteligencia:eliminar]
archivos:
  - frontend/src/app/dashboard/seguridad/inteligencia-artificial/configuracion/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-ia]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [seguridad, inteligencia, artificial, configuracion, desactivar, eliminar]
---

# /dashboard/seguridad/inteligencia-artificial/configuracion

Pantalla /dashboard/seguridad/inteligencia-artificial/configuracion.

- **Ruta:** `/dashboard/seguridad/inteligencia-artificial/configuracion`
- **Permisos referenciados:** `inteligencia:desactivar`, `inteligencia:eliminar`

## Archivos

- `frontend/src/app/dashboard/seguridad/inteligencia-artificial/configuracion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-ia|ia]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
