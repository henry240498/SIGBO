---
id: entity--ia-mensaje
tipo: ENTITY
nombre: MensajeIa
nivel: L1
dominio: inteligencia
resumen: "Un turno dentro de una conversacion (seccion 7 del pedido). `duracionMs` y `fuentesJson` viven en la fila de rol IA -- son propiedades de generar esa respuesta, no de la conversacion completa. Sin tokens de proveedor: el motor de razonamiento sigue siendo local y deterministico (IaMotorService), nadie factura por token (pivote de arquitectura, migracion 060). `modeloUtilizado` (migracion 072) es solo informativo: que modelo local de Ollama, si alguno, ayudo a redactar esta respuesta puntual -- queda NULL en todo mensaje que no paso por Ollama."
tabla: ia.mensajes
archivos:
  - backend/src/shared/entities/ia-mensaje.entity.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [persisted_in, table--ia-mensajes]
terminos: [mensaje, mensajes, rol, usuario, sistema, herramienta, resultado, denegado, error, bloqueado]
---

# MensajeIa

Un turno dentro de una conversacion (seccion 7 del pedido). `duracionMs` y `fuentesJson` viven en la fila de rol IA -- son propiedades de generar esa respuesta, no de la conversacion completa. Sin tokens de proveedor: el motor de razonamiento sigue siendo local y deterministico (IaMotorService), nadie factura por token (pivote de arquitectura, migracion 060). `modeloUtilizado` (migracion 072) es solo informativo: que modelo local de Ollama, si alguno, ayudo a redactar esta respuesta puntual -- queda NULL en todo mensaje que no paso por Ollama.

- **Tabla:** [[table--ia-mensajes|ia.mensajes]]
- **Columnas mapeadas:** 8

## Estados y enumeraciones

- `RolMensajeIa`: `USUARIO` · `IA` · `SISTEMA` · `HERRAMIENTA`
- `ResultadoMensajeIa`: `OK` · `DENEGADO` · `ERROR` · `BLOQUEADO`

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaAdminConversacionesController, IaChatController, IaConfiguracionController, IaDashboardController, IaVozController
- **Servicios:** IaChatService, IaConfiguracionService, IaConversacionesService, IaDashboardService, IaVozService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ia-mensaje.entity.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `persisted_in` → [[table--ia-mensajes|ia.mensajes]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `uses` →
- [[service--ia-ia-dashboard|IaDashboardService]] `uses` →
- [[service--ia-ia-voz|IaVozService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
