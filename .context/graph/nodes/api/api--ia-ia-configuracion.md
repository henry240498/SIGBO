---
id: api--ia-ia-configuracion
tipo: API
nombre: IaConfiguracionController
nivel: L2
dominio: inteligencia
resumen: Superficie HTTP de ia configuracion bajo /api/v1/ia/admin/config.
prefijo: /api/v1/ia/admin/config
capa: backend
permisos: [inteligencia:configurar, inteligencia:desactivar]
archivos:
  - backend/src/modules/ia/ia-configuracion.controller.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [exposes, service--ia-ia-configuracion]
  - [exposes, service--ia-ollama]
  - [exposes, service--ia-whisper]
  - [exposes, service--ia-piper]
  - [exposes, service--ia-ia-configuracion]
terminos: [configuracion, admin, config, inteligencia, configurar, desactivar]
---

# IaConfiguracionController

Superficie HTTP de ia configuracion bajo /api/v1/ia/admin/config.

- **Prefijo:** `/api/v1/ia/admin/config`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/ia/admin/config` | `inteligencia:configurar` |
| GET | `/ia/admin/config/ollama/estado` | `inteligencia:configurar` |
| POST | `/ia/admin/config/ollama/probar-conexion` | `inteligencia:configurar` |
| GET | `/ia/admin/config/whisper/estado` | `inteligencia:configurar` |
| GET | `/ia/admin/config/piper/estado` | `inteligencia:configurar` |
| GET | `/ia/admin/config/piper/voces` | `inteligencia:configurar` |
| GET | `/ia/admin/config/historial` | `inteligencia:configurar` |
| PATCH | `/ia/admin/config` | `inteligencia:configurar` |
| PATCH | `/ia/admin/config` | `inteligencia:desactivar` |

## Archivos

- `backend/src/modules/ia/ia-configuracion.controller.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `exposes` → [[service--ia-ia-configuracion|IaConfiguracionService]]
- `exposes` → [[service--ia-ollama|OllamaService]]
- `exposes` → [[service--ia-whisper|WhisperService]]
- `exposes` → [[service--ia-piper|PiperService]]
- `exposes` → [[service--ia-ia-configuracion|IaConfiguracionService]]

## Referenciado por

- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →
- [[component--front-ia|ia]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
