---
id: service--control-personal-avisos-vencimiento
tipo: SERVICE
nombre: AvisosVencimientoService
nivel: L2
dominio: asistencia
resumen: "Aviso por Telegram de lo que esta por vencer (opt-in: sin Telegram configurado no hace nada). Cada vencimiento se avisa una vez por umbral (30, 15, 7, 3 dias, el dia, y una vez vencido). Si el envio falla no se anota nada, asi que se reintenta en la proxima pasada."
capa: backend
archivos:
  - backend/src/modules/control-personal/avisos-vencimiento.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-control-personal]
  - [uses, service--control-personal-vencimientos]
  - [uses, service--notificaciones-telegram]
terminos: [avisos, vencimiento, control, personal]
---

# AvisosVencimientoService

Aviso por Telegram de lo que esta por vencer (opt-in: sin Telegram configurado no hace nada). Cada vencimiento se avisa una vez por umbral (30, 15, 7, 3 dias, el dia, y una vez vencido). Si el envio falla no se anota nada, asi que se reintenta en la proxima pasada.


## Metodos

`if()` · `onModuleInit()` · `onModuleDestroy()` · `ejecutar()`

## Archivos

- `backend/src/modules/control-personal/avisos-vencimiento.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-control-personal|control-personal (modulo NestJS)]]
- `uses` → [[service--control-personal-vencimientos|VencimientosService]]
- `uses` → [[service--notificaciones-telegram|TelegramService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
