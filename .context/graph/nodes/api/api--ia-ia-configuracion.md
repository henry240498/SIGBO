---
id: api--ia-ia-configuracion
tipo: API
nombre: IaConfiguracionController
nivel: L2
dominio: inteligencia
resumen: Superficie HTTP de ia configuracion bajo /api/v1/ia/admin / <CONFIGURAR_ACCESO_LOCAL>
prefijo: /api/v1/ia/admin / <CONFIGURAR_ACCESO_LOCAL>
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

Superficie HTTP de ia configuracion bajo /api/v1/ia/admin / <CONFIGURAR_ACCESO_LOCAL>

- **Prefijo:** `/api/v1/ia/admin / <CONFIGURAR_ACCESO_LOCAL>

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL> | `inteligencia:configurar` |
| GET | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL>/ollama/estado` | `inteligencia:configurar` |
| POST | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL>/ollama/probar-conexion` | `inteligencia:configurar` |
| GET | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL>/whisper/estado` | `inteligencia:configurar` |
| GET | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL>/piper/estado` | `inteligencia:configurar` |
| GET | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL>/piper/voces` | `inteligencia:configurar` |
| GET | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL>/historial` | `inteligencia:configurar` |
| PATCH | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL> | `inteligencia:configurar` |
| PATCH | `/ia/admin / <CONFIGURAR_ACCESO_LOCAL> | `inteligencia:desactivar` |

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
