---
id: service--notificaciones-telegram
tipo: SERVICE
nombre: TelegramService
nivel: L2
dominio: servicios
resumen: "Avisos opcionales a un grupo o canal de Telegram (API de bots, abierta y gratuita). - Sin TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID no hace nada: es opt-in del cuartel. - Nunca lanza ni espera de mas: si Telegram no responde, la operacion que lo pidio (crear una alerta o una convocatoria) sigue como si nada. - Nunca escribe el token en los registros. - Es solo un AVISO: las respuestas (\"voy\") siguen entrando por la app, donde hay usuario, permisos y auditoria."
capa: backend
archivos:
  - backend/src/modules/notificaciones/telegram.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-notificaciones]
terminos: [telegram, notificaciones]
---

# TelegramService

Avisos opcionales a un grupo o canal de Telegram (API de bots, abierta y gratuita). - Sin TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID no hace nada: es opt-in del cuartel. - Nunca lanza ni espera de mas: si Telegram no responde, la operacion que lo pidio (crear una alerta o una convocatoria) sigue como si nada. - Nunca escribe el token en los registros. - Es solo un AVISO: las respuestas ("voy") siguen entrando por la app, donde hay usuario, permisos y auditoria.


## Metodos

`habilitado()` · `enviar()` · `enviarEnSegundoPlano()`

## Archivos

- `backend/src/modules/notificaciones/telegram.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-notificaciones|notificaciones (modulo NestJS)]]

## Referenciado por

- [[service--control-personal-avisos-vencimiento|AvisosVencimientoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
