---
id: api--finanzas-cuentas-bancarias
tipo: API
nombre: CuentasBancariasController
nivel: L2
dominio: finanzas
resumen: "GET exige 'finanzas:ver' (igual que el resto del modulo -- se necesita para combos de movimientos); crear/editar exige 'finanzas:administrar_cajas' porque son datos bancarios sensibles de configuracion (seccion 11: \"nunca mostrar informacion bancaria sensible a usuarios sin permiso\" -- el enmascarado de campos queda pendiente, ver informe final)."
prefijo: /api/v1/finanzas/cuentas-bancarias
capa: backend
permisos: [finanzas:ver, finanzas:administrar_cajas]
archivos:
  - backend/src/modules/finanzas/cuentas-bancarias.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-cuentas-bancarias]
terminos: [cuentas, bancarias, finanzas, ver, administrar, cajas]
---

# CuentasBancariasController

GET exige 'finanzas:ver' (igual que el resto del modulo -- se necesita para combos de movimientos); crear/editar exige 'finanzas:administrar_cajas' porque son datos bancarios sensibles de configuracion (seccion 11: "nunca mostrar informacion bancaria sensible a usuarios sin permiso" -- el enmascarado de campos queda pendiente, ver informe final).

- **Prefijo:** `/api/v1/finanzas/cuentas-bancarias`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/cuentas-bancarias` | `finanzas:ver` |
| GET | `/finanzas/cuentas-bancarias/:id` | `finanzas:ver` |
| POST | `/finanzas/cuentas-bancarias` | `finanzas:administrar_cajas` |
| PATCH | `/finanzas/cuentas-bancarias/:id` | `finanzas:administrar_cajas` |

## Archivos

- `backend/src/modules/finanzas/cuentas-bancarias.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-cuentas-bancarias|CuentasBancariasService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
