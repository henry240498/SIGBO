---
id: component--front-permisospantallaprovider
tipo: COMPONENT
nombre: PermisosPantallaProvider
nivel: L2
resumen: "Helper de frontend \"PermisosPantallaProvider\" (7 exportaciones, consume 2 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/app/components/PermisosPantallaProvider.tsx
edges:
  - [calls, api--pantallas-pantallas]
  - [calls, api--centro-mando-centro-mando]
terminos: [permisos, pantalla, provider, acceso, centro, mando, use, puede, tabs, visibles, sesion, rutas]
---

# PermisosPantallaProvider

Helper de frontend "PermisosPantallaProvider" (7 exportaciones, consume 2 endpoint(s)).


## Archivos

- `frontend/src/app/components/PermisosPantallaProvider.tsx`

## Relaciones

- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--centro-mando-centro-mando|CentroMandoController]]

## Referenciado por

- [[screen--dashboard-centro-mando|/dashboard/centro-mando]] `uses` →
- [[screen--dashboard|/dashboard]] `uses` →
- [[screen--dashboard-sistema-datos|/dashboard/sistema/datos]] `uses` →
- [[screen--dashboard-sistema|/dashboard/sistema]] `uses` →
- [[screen--dashboard-sistema-registros|/dashboard/sistema/registros]] `uses` →
- [[screen--dashboard-sistema-tareas|/dashboard/sistema/tareas]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
