---
id: api--campo-campo
tipo: API
nombre: CampoController
nivel: L2
dominio: servicios
resumen: Fotos y firmas de terreno, victimas por servicio y ausencias del personal.
prefijo: /api/v1
capa: backend
permisos: [adjuntos:subir, adjuntos:ver, servicios:ver, servicios:editar, ausencias:solicitar, ausencias:decidir]
archivos:
  - backend/src/modules/campo/campo.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--campo-adjuntos]
  - [exposes, service--campo-victimas]
  - [exposes, service--campo-ausencias]
terminos: [campo, adjuntos, subir, ver, servicios, editar, ausencias, solicitar, decidir]
---

# CampoController

Fotos y firmas de terreno, victimas por servicio y ausencias del personal.

- **Prefijo:** `/api/v1`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/adjuntos` | `adjuntos:subir` |
| GET | `/adjuntos` | `adjuntos:ver` |
| GET | `/adjuntos/:id/archivo` | `adjuntos:ver` |
| GET | `/siniestros/victimas` | `servicios:ver` |
| POST | `/siniestros/victimas` | `servicios:editar` |
| GET | `/ausencias` | `ausencias:solicitar` |
| POST | `/ausencias` | `ausencias:solicitar` |
| PATCH | `/ausencias/:id/decision` | `ausencias:decidir` |
| PATCH | `/ausencias/:id/cancelar` | `ausencias:solicitar` |

## Archivos

- `backend/src/modules/campo/campo.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--campo-adjuntos|AdjuntosService]]
- `exposes` → [[service--campo-victimas|VictimasService]]
- `exposes` → [[service--campo-ausencias|AusenciasService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
