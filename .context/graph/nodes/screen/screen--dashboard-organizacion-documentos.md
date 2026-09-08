---
id: screen--dashboard-organizacion-documentos
tipo: SCREEN
nombre: /dashboard/organizacion/documentos
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/documentos.
ruta: /dashboard/organizacion/documentos
capa: frontend
permisos: [organizacion:documentos_ver, organizacion:documentos_configurar]
archivos:
  - frontend/src/app/dashboard/organizacion/documentos/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-api]
  - [uses, component--front-organizacion]
  - [uses, component--front-parametros]
  - [uses, component--front-documentos]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [organizacion, documentos, ver, configurar]
---

# /dashboard/organizacion/documentos

Pantalla /dashboard/organizacion/documentos.

- **Ruta:** `/dashboard/organizacion/documentos`
- **Permisos referenciados:** `organizacion:documentos_ver`, `organizacion:documentos_configurar`

## Archivos

- `frontend/src/app/dashboard/organizacion/documentos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-organizacion|organizacion]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-documentos|documentos]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
