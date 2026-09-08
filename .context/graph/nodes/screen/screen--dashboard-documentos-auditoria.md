---
id: screen--dashboard-documentos-auditoria
tipo: SCREEN
nombre: /dashboard/documentos/auditoria
nivel: L1
dominio: documentos
resumen: Pantalla /dashboard/documentos/auditoria.
ruta: /dashboard/documentos/auditoria
capa: frontend
archivos:
  - frontend/src/app/dashboard/documentos/auditoria/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-documentos]
  - [uses, component--front-aviso]
terminos: [documentos, auditoria]
---

# /dashboard/documentos/auditoria

Pantalla /dashboard/documentos/auditoria.

- **Ruta:** `/dashboard/documentos/auditoria`

## Archivos

- `frontend/src/app/dashboard/documentos/auditoria/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-documentos|documentos]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
