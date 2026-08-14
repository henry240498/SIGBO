---
id: component--front-configuracion
tipo: COMPONENT
nombre: configuracion
nivel: L2
resumen: "Helper de frontend \"configuracion\" (8 exportaciones, consume 2 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/configuracion.ts
edges:
  - [calls, api--configuracion-configuracion]
  - [calls, api--configuracion-configuracion]
terminos: [configuracion, config, definition, resolved, value, device, key, preferencias, dispositivo, guardar, aplicar, cargar, publica, registro, publico]
---

# configuracion

Helper de frontend "configuracion" (8 exportaciones, consume 2 endpoint(s)).


## Archivos

- `frontend/src/lib/configuracion.ts`

## Relaciones

- `calls` → [[api--configuracion-configuracion|ConfiguracionController]]
- `calls` → [[api--configuracion-configuracion|ConfiguracionController]]

## Referenciado por

- [[screen--dashboard-mi-perfil-preferencias|/dashboard/mi-perfil/preferencias]] `uses` →
- [[screen--dashboard-seguridad-configuracion|/dashboard/seguridad/configuracion]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
