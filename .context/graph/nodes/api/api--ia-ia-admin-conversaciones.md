---
id: api--ia-ia-admin-conversaciones
tipo: API
nombre: IaAdminConversacionesController
nivel: L2
dominio: inteligencia
resumen: "Panel exclusivo de Seguridad -> Inteligencia Artificial (seccion 34 del pedido): ver conversaciones ajenas exige `inteligencia:ver_conversaciones`, distinto del permiso basico `inteligencia:usar` que solo da acceso a las propias (seccion 53, privacidad)."
prefijo: /api/v1/ia/admin
capa: backend
permisos: [inteligencia:ver_conversaciones, inteligencia:ver_auditoria]
archivos:
  - backend/src/modules/ia/ia-admin-conversaciones.controller.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [exposes, service--ia-ia-conversaciones]
  - [exposes, service--seguridad-auditoria]
terminos: [admin, conversaciones, inteligencia, ver, auditoria]
---

# IaAdminConversacionesController

Panel exclusivo de Seguridad -> Inteligencia Artificial (seccion 34 del pedido): ver conversaciones ajenas exige `inteligencia:ver_conversaciones`, distinto del permiso basico `inteligencia:usar` que solo da acceso a las propias (seccion 53, privacidad).

- **Prefijo:** `/api/v1/ia/admin`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/ia/admin/conversaciones` | `inteligencia:ver_conversaciones` |
| GET | `/ia/admin/conversaciones/:id/ejecuciones` | `inteligencia:ver_conversaciones` |
| GET | `/ia/admin/auditoria` | `inteligencia:ver_auditoria` |

## Archivos

- `backend/src/modules/ia/ia-admin-conversaciones.controller.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `exposes` → [[service--ia-ia-conversaciones|IaConversacionesService]]
- `exposes` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
