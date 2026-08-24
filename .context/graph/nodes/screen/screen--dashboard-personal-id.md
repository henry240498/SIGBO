---
id: screen--dashboard-personal-id
tipo: SCREEN
nombre: "/dashboard/personal/[id]"
nivel: L1
dominio: personal
resumen: "Pantalla /dashboard/personal/[id], consume 5 endpoint(s)."
ruta: /dashboard/personal/[id]
capa: frontend
permisos: [personal:editar, personal:eliminar_fisico, equipos:prestar, personal:gestionar_firma_digital, personal:seguros_ver, personal:seguros_crear, personal:seguros_editar, personal:seguros_eliminar, personal:generar_foja]
archivos:
  - frontend/src/app/dashboard/personal/[id]/page.tsx
edges:
  - [belongs_to, domain--personal]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-json-seguro]
  - [uses, component--front-parametros]
  - [uses, component--front-guardias]
  - [uses, component--front-personal]
  - [uses, component--front-academia]
  - [uses, component--front-deposito]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--equipos-equipos]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--vehiculos-vehiculos]
  - [calls, api--seguridad-auditoria]
terminos: [personal, editar, eliminar, fisico, equipos, prestar, gestionar, firma, digital, seguros, ver, crear, generar, foja]
---

# /dashboard/personal/[id]

Pantalla /dashboard/personal/[id], consume 5 endpoint(s).

- **Ruta:** `/dashboard/personal/[id]`
- **Permisos referenciados:** `personal:editar`, `personal:eliminar_fisico`, `equipos:prestar`, `personal:gestionar_firma_digital`, `personal:seguros_ver`, `personal:seguros_crear`, `personal:seguros_editar`, `personal:seguros_eliminar`, `personal:generar_foja`

## Endpoints que consume

- `/personal/bomberos/`
- `/equipos/equipos?estado=OPERATIVO`
- `/personal/bomberos/equipamiento/`
- `/vehiculos/vehiculos?estado=OPERATIVO`
- `/seguridad/auditoria?recurso=personal.bomberos&recursoId=`

## Archivos

- `frontend/src/app/dashboard/personal/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-json-seguro|json-seguro]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-academia|academia]]
- `uses` → [[component--front-deposito|deposito]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--equipos-equipos|EquiposController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--vehiculos-vehiculos|VehiculosController]]
- `calls` → [[api--seguridad-auditoria|AuditoriaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
