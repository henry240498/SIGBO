---
id: screen--dashboard-seguridad-apariencia
tipo: SCREEN
nombre: /dashboard/seguridad/apariencia
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/apariencia, consume 2 endpoint(s).
ruta: /dashboard/seguridad/apariencia
capa: frontend
permisos: [seguridad:configurar_apariencia, seguridad:configurar_politica_perfil]
archivos:
  - frontend/src/app/dashboard/seguridad/apariencia/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
  - [calls, api--seguridad-apariencia]
  - [calls, api--seguridad-apariencia]
terminos: [seguridad, apariencia, configurar, politica, perfil]
---

# /dashboard/seguridad/apariencia

Pantalla /dashboard/seguridad/apariencia, consume 2 endpoint(s).

- **Ruta:** `/dashboard/seguridad/apariencia`
- **Permisos referenciados:** `seguridad:configurar_apariencia`, `seguridad:configurar_politica_perfil`

## Endpoints que consume

- `/seguridad/apariencia`
- `/seguridad/apariencia/politica-perfil`

## Archivos

- `frontend/src/app/dashboard/seguridad/apariencia/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]
- `calls` → [[api--seguridad-apariencia|AparienciaController]]
- `calls` → [[api--seguridad-apariencia|AparienciaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
