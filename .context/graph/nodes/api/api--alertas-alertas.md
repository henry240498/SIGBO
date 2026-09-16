---
id: api--alertas-alertas
tipo: API
nombre: AlertasController
nivel: L2
dominio: servicios
resumen: "Alertas inmediatas de bomberos (apoyo / chofer) para la app movil. Reutiliza el login JWT existente (cabecera `Authorization: Bearer`, ya aceptada por `extraerAccessToken`) y los permisos de Servicios, sin crear un esquema de autorizacion paralelo. Prefijo global: /api/v1."
prefijo: /api/v1/alertas
capa: backend
permisos: [servicios:ver, servicios:crear]
archivos:
  - backend/src/modules/alertas/alertas.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--alertas-alertas]
terminos: [alertas, servicios, ver, crear]
---

# AlertasController

Alertas inmediatas de bomberos (apoyo / chofer) para la app movil. Reutiliza el login JWT existente (cabecera `Authorization: Bearer`, ya aceptada por `extraerAccessToken`) y los permisos de Servicios, sin crear un esquema de autorizacion paralelo. Prefijo global: /api/v1.

- **Prefijo:** `/api/v1/alertas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/alertas` | `servicios:ver` |
| GET | `/alertas/:id` | `servicios:ver` |
| POST | `/alertas` | `servicios:crear` |

## Archivos

- `backend/src/modules/alertas/alertas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--alertas-alertas|AlertasService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
