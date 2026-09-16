---
id: api--configuracion-configuracion
tipo: API
nombre: ConfiguracionController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de configuracion bajo /api/v1/configuracion.
prefijo: /api/v1/configuracion
capa: backend
permisos: [configuracion:ver, seguridad:configurar_apariencia, configuracion:editar_borrador, configuracion:publicar, configuracion:restaurar, configuracion:exportar]
archivos:
  - backend/src/modules/configuracion/configuracion.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--configuracion-configuracion]
terminos: [configuracion, ver, seguridad, configurar, apariencia, editar, borrador, publicar, restaurar, exportar]
---

# ConfiguracionController

Superficie HTTP de configuracion bajo /api/v1/configuracion.

- **Prefijo:** `/api/v1/configuracion`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/configuracion/publica` | — |
| GET | `/configuracion/registro-publico` | — |
| GET | `/configuracion/registro-preferencias` | — |
| GET | `/configuracion/mis-preferencias` | — |
| PUT | `/configuracion/mis-preferencias` | — |
| GET | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL> | `configuracion:ver` o `seguridad:configurar_apariencia` |
| POST | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL> | `configuracion:editar_borrador` o `seguridad:configurar_apariencia` |
| GET | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL>/:id` | `configuracion:ver` o `seguridad:configurar_apariencia` |
| PUT | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL>/:id` | `configuracion:editar_borrador` o `seguridad:configurar_apariencia` |
| POST | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL>/:id/validar` | `configuracion:ver` o `seguridad:configurar_apariencia` |
| POST | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL>/:id/publicar` | `configuracion:publicar` o `seguridad:configurar_apariencia` |
| GET | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL> | `configuracion:ver` o `seguridad:configurar_apariencia` |
| POST | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL>/:id/restaurar` | `configuracion:restaurar` o `seguridad:configurar_apariencia` |
| GET | `/configuracion/admin / <CONFIGURAR_ACCESO_LOCAL> | `configuracion:exportar` o `seguridad:configurar_apariencia` |

## Archivos

- `backend/src/modules/configuracion/configuracion.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--configuracion-configuracion|ConfiguracionService]]

## Referenciado por

- [[screen--dashboard-mi-perfil-preferencias|/dashboard/mi-perfil/preferencias]] `calls` →
- [[screen--dashboard-mi-perfil-preferencias|/dashboard/mi-perfil/preferencias]] `calls` →
- [[component--front-configuracion|configuracion]] `calls` →
- [[component--front-configuracion|configuracion]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
