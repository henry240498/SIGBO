---
id: service--sistema-sistema
tipo: SERVICE
nombre: SistemaService
nivel: L2
dominio: seguridad
resumen: Estado real de los servicios, agentes y tareas del sistema, y sus operaciones seguras.
capa: backend
archivos:
  - backend/src/modules/sistema/sistema.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-sistema]
  - [uses, service--pantallas-matriz-web]
  - [uses, service--seguridad-auditoria]
  - [uses, service--sistema-respaldos]
  - [uses, service--gre-gre-trabajador]
  - [uses, service--control-personal-avisos-vencimiento]
  - [uses, service--alertas-alertas]
  - [uses, service--ia-ia-configuracion]
  - [uses, service--ia-ollama]
  - [uses, service--ia-whisper]
  - [uses, service--ia-piper]
  - [uses, service--app-movil-app-movil]
  - [uses, service--notificaciones-telegram]
terminos: [sistema]
---

# SistemaService

Estado real de los servicios, agentes y tareas del sistema, y sus operaciones seguras.


## Metodos

`estado()` · `resumen()` · `tareasYTrabajos()` · `ejecutarAvisos()` · `registros()` · `appMovil()` · `conexionMovil()`

## Archivos

- `backend/src/modules/sistema/sistema.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-sistema|sistema (modulo NestJS)]]
- `uses` → [[service--pantallas-matriz-web|MatrizWebService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--sistema-respaldos|RespaldosService]]
- `uses` → [[service--gre-gre-trabajador|GreTrabajadorService]]
- `uses` → [[service--control-personal-avisos-vencimiento|AvisosVencimientoService]]
- `uses` → [[service--alertas-alertas|AlertasService]]
- `uses` → [[service--ia-ia-configuracion|IaConfiguracionService]]
- `uses` → [[service--ia-ollama|OllamaService]]
- `uses` → [[service--ia-whisper|WhisperService]]
- `uses` → [[service--ia-piper|PiperService]]
- `uses` → [[service--app-movil-app-movil|AppMovilService]]
- `uses` → [[service--notificaciones-telegram|TelegramService]]

## Referenciado por

- [[service--centro-mando-centro-mando|CentroMandoService]] `uses` →
- [[api--sistema-sistema|SistemaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
