---
id: component--front-publicaciones
tipo: COMPONENT
nombre: publicaciones
nivel: L2
dominio: publicaciones
resumen: "Helper de frontend \"publicaciones\" (10 exportaciones, consume 3 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/publicaciones.ts
edges:
  - [calls, api--publicaciones-publicaciones]
  - [calls, api--publicaciones-publicaciones]
  - [calls, api--publicaciones-publicaciones]
terminos: [publicaciones, seccion, publica, estado, contenido, publicacion, estadisticas, publicas, nueva, cargar, crear, actualizar, eliminar]
---

# publicaciones

Helper de frontend "publicaciones" (10 exportaciones, consume 3 endpoint(s)).


## Archivos

- `frontend/src/lib/publicaciones.ts`

## Relaciones

- `calls` → [[api--publicaciones-publicaciones|PublicacionesController]]
- `calls` → [[api--publicaciones-publicaciones|PublicacionesController]]
- `calls` → [[api--publicaciones-publicaciones|PublicacionesController]]

## Referenciado por

- [[screen--dashboard-publicaciones|/dashboard/publicaciones]] `uses` →
- [[screen--raiz|/]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
