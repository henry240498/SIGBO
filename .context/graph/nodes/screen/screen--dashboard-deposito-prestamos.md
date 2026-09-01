---
id: screen--dashboard-deposito-prestamos
tipo: SCREEN
nombre: /dashboard/deposito/prestamos
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/prestamos.
ruta: /dashboard/deposito/prestamos
capa: frontend
permisos: [deposito:prestar]
archivos:
  - frontend/src/app/dashboard/deposito/prestamos/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-equipos]
  - [uses, component--front-deposito]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [deposito, prestamos, prestar]
---

# /dashboard/deposito/prestamos

Pantalla /dashboard/deposito/prestamos.

- **Ruta:** `/dashboard/deposito/prestamos`
- **Permisos referenciados:** `deposito:prestar`

## Archivos

- `frontend/src/app/dashboard/deposito/prestamos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
