---
id: screen--dashboard-sistema
tipo: SCREEN
nombre: /dashboard/sistema
nivel: L1
dominio: sistema
resumen: Pantalla /dashboard/sistema, consume 4 endpoint(s).
ruta: /dashboard/sistema
capa: frontend
permisos: [inteligencia:desactivar, inteligencia:configurar]
archivos:
  - frontend/src/app/dashboard/sistema/page.tsx
edges:
  - [belongs_to, domain--sistema]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-inputprovider]
  - [uses, component--front-permisospantallaprovider]
  - [uses, component--front-useactualizacionperiodica]
  - [calls, api--sistema-sistema]
  - [calls, api--sistema-sistema]
  - [calls, api--ia-ia-admin-conversaciones]
  - [calls, api--ia-ia-configuracion]
terminos: [sistema, inteligencia, desactivar, configurar]
---

# /dashboard/sistema

Pantalla /dashboard/sistema, consume 4 endpoint(s).

- **Ruta:** `/dashboard/sistema`
- **Permisos referenciados:** `inteligencia:desactivar`, `inteligencia:configurar`

## Endpoints que consume

- `/sistema/estado`
- `/sistema/resumen`
- `/ia/admin/estado`
- `/ia/admin/config/ollama/probar-conexion`

## Archivos

- `frontend/src/app/dashboard/sistema/page.tsx`

## Relaciones

- `belongs_to` → [[domain--sistema|Sistema]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-inputprovider|InputProvider]]
- `uses` → [[component--front-permisospantallaprovider|PermisosPantallaProvider]]
- `uses` → [[component--front-useactualizacionperiodica|useActualizacionPeriodica]]
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]]
- `calls` → [[api--ia-ia-configuracion|IaConfiguracionController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
