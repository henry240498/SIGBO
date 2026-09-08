---
id: api--ia-ia-voz
tipo: API
nombre: IaVozController
nivel: L2
dominio: inteligencia
resumen: "Voz alrededor de Snoopy (Etapa 2 del pedido): mismo permiso que el chat de texto (`inteligencia:usar`, sin permiso nuevo -- seccion \"no crear una via alternativa\") y el mismo limitador anti-abuso. Estos endpoints NUNCA tocan `IaMotorService`/`IaToolsService`: solo convierten audio<->texto alrededor del `/ia/chat` que ya existe y no cambia."
prefijo: /api/v1/ia/voz
capa: backend
permisos: [inteligencia:usar]
archivos:
  - backend/src/modules/ia/ia-voz.controller.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [exposes, service--ia-ia-voz]
terminos: [voz, inteligencia, usar]
---

# IaVozController

Voz alrededor de Snoopy (Etapa 2 del pedido): mismo permiso que el chat de texto (`inteligencia:usar`, sin permiso nuevo -- seccion "no crear una via alternativa") y el mismo limitador anti-abuso. Estos endpoints NUNCA tocan `IaMotorService`/`IaToolsService`: solo convierten audio<->texto alrededor del `/ia/chat` que ya existe y no cambia.

- **Prefijo:** `/api/v1/ia/voz`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| POST | `/ia/voz/hablar` | `inteligencia:usar` |

## Archivos

- `backend/src/modules/ia/ia-voz.controller.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `exposes` → [[service--ia-ia-voz|IaVozService]]

## Referenciado por

- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
