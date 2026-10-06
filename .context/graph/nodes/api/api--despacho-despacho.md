---
id: api--despacho-despacho
tipo: API
nombre: DespachoController
nivel: L2
dominio: servicios
resumen: "Despacho y coordinacion operativa. Todo se valida en el backend: el permiso se exige aca, la app solo oculta lo que no corresponde. - despacho:responder cualquier persona del cuartel: recibe, responde, declara su disponibilidad - despacho:solicitar crea, amplia y cierra solicitudes - despacho:seguimiento ve quien respondio y la linea de tiempo"
prefijo: /api/v1/despacho
capa: backend
permisos: [despacho:responder, despacho:solicitar, despacho:seguimiento]
archivos:
  - backend/src/modules/despacho/despacho.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--despacho-despacho]
terminos: [despacho, responder, solicitar, seguimiento]
---

# DespachoController

Despacho y coordinacion operativa. Todo se valida en el backend: el permiso se exige aca, la app solo oculta lo que no corresponde. - despacho:responder cualquier persona del cuartel: recibe, responde, declara su disponibilidad - despacho:solicitar crea, amplia y cierra solicitudes - despacho:seguimiento ve quien respondio y la linea de tiempo

- **Prefijo:** `/api/v1/despacho`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/despacho/presencia` | `despacho:responder` |
| GET | `/despacho/disponibilidad/mia` | `despacho:responder` |
| PUT | `/despacho/disponibilidad/mia` | `despacho:responder` |
| PUT | `/despacho/disponibilidad/horarios` | `despacho:responder` |
| POST | `/despacho/disponibilidad/excepciones` | `despacho:responder` |
| DELETE | `/despacho/disponibilidad/excepciones/:id` | `despacho:responder` |
| GET | `/despacho/solicitudes/mias` | `despacho:responder` |
| POST | `/despacho/solicitudes/:id/recibida` | `despacho:responder` |
| POST | `/despacho/solicitudes/:id/responder` | `despacho:responder` |
| POST | `/despacho/solicitudes/:id/unirme` | `despacho:responder` |
| POST | `/despacho/solicitudes` | `despacho:solicitar` |
| GET | `/despacho/solicitudes` | `despacho:seguimiento` |
| GET | `/despacho/solicitudes/:id` | `despacho:seguimiento` |
| GET | `/despacho/solicitudes/:id/linea` | `despacho:seguimiento` |
| POST | `/despacho/solicitudes/:id/ampliar` | `despacho:solicitar` |
| POST | `/despacho/solicitudes/:id/cerrar` | `despacho:solicitar` |

## Archivos

- `backend/src/modules/despacho/despacho.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--despacho-despacho|DespachoService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
