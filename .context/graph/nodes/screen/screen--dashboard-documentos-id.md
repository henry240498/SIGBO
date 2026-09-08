---
id: screen--dashboard-documentos-id
tipo: SCREEN
nombre: "/dashboard/documentos/[id]"
nivel: L1
dominio: documentos
resumen: "Pantalla /dashboard/documentos/[id]."
ruta: /dashboard/documentos/[id]
capa: frontend
permisos: [documentos:editar, documentos:subir, documentos:descargar, documentos:aprobar, documentos:anular, documentos:eliminar, documentos:administrar, documentos:ver_auditoria, documentos:firmar]
archivos:
  - frontend/src/app/dashboard/documentos/[id]/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-documentos]
  - [uses, component--front-cargando]
terminos: [documentos, editar, subir, descargar, aprobar, anular, eliminar, administrar, ver, auditoria, firmar]
---

# /dashboard/documentos/[id]

Pantalla /dashboard/documentos/[id].

- **Ruta:** `/dashboard/documentos/[id]`
- **Permisos referenciados:** `documentos:editar`, `documentos:subir`, `documentos:descargar`, `documentos:aprobar`, `documentos:anular`, `documentos:eliminar`, `documentos:administrar`, `documentos:ver_auditoria`, `documentos:firmar`

## Archivos

- `frontend/src/app/dashboard/documentos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-documentos|documentos]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
