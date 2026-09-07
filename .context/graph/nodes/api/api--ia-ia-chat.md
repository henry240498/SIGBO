---
id: api--ia-ia-chat
tipo: API
nombre: IaChatController
nivel: L2
dominio: inteligencia
resumen: Superficie HTTP de ia chat bajo /api/v1/ia.
prefijo: /api/v1/ia
capa: backend
permisos: [inteligencia:usar]
archivos:
  - backend/src/modules/ia/ia-chat.controller.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [exposes, service--ia-ia-chat]
  - [exposes, service--ia-ia-conversaciones]
  - [exposes, service--ia-ia-configuracion]
terminos: [chat, inteligencia, usar]
---

# IaChatController

Superficie HTTP de ia chat bajo /api/v1/ia.

- **Prefijo:** `/api/v1/ia`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/ia/chat` | `inteligencia:usar` |
| GET | `/ia/conversaciones` | `inteligencia:usar` |
| GET | `/ia/conversaciones/:id` | `inteligencia:usar` |

## Archivos

- `backend/src/modules/ia/ia-chat.controller.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `exposes` → [[service--ia-ia-chat|IaChatService]]
- `exposes` → [[service--ia-ia-conversaciones|IaConversacionesService]]
- `exposes` → [[service--ia-ia-configuracion|IaConfiguracionService]]

## Referenciado por

- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
