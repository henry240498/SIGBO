---
id: service--ia-ia-voz
tipo: SERVICE
nombre: IaVozService
nivel: L2
dominio: inteligencia
resumen: "Orquesta voz alrededor del NUCLEO de Snoopy que ya existe -- nunca lo reemplaza ni lo duplica (seccion 2 del pedido de voz: \"ambos modos deben utilizar exactamente el mismo nucleo... no duplicar la logica de consulta para voz\"). `transcribir()` solo convierte audio a texto: el texto resultante lo manda el FRONTEND al mismo `POST /ia/chat` de siempre, con las mismas verificaciones de autenticacion/autorizacion/ permisos/auditoria que un mensaje escrito (seccion 10, regla absoluta). `hablar()` solo lee en voz alta un mensaje que Snoopy YA dijo y que YA quedo guardado -- nunca texto libre que un cliente HTTP quiera hacerle \"decir\" a la mascota institucional."
capa: backend
archivos:
  - backend/src/modules/ia/ia-voz.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--ia-mensaje]
  - [reads, table--ia-mensajes]
  - [uses, entity--ia-conversacion]
  - [reads, table--ia-conversaciones]
  - [uses, service--ia-ia-configuracion]
  - [uses, service--ia-whisper]
  - [uses, service--ia-piper]
terminos: [voz, mensaje, conversacion]
---

# IaVozService

Orquesta voz alrededor del NUCLEO de Snoopy que ya existe -- nunca lo reemplaza ni lo duplica (seccion 2 del pedido de voz: "ambos modos deben utilizar exactamente el mismo nucleo... no duplicar la logica de consulta para voz"). `transcribir()` solo convierte audio a texto: el texto resultante lo manda el FRONTEND al mismo `POST /ia/chat` de siempre, con las mismas verificaciones de autenticacion/autorizacion/ permisos/auditoria que un mensaje escrito (seccion 10, regla absoluta). `hablar()` solo lee en voz alta un mensaje que Snoopy YA dijo y que YA quedo guardado -- nunca texto libre que un cliente HTTP quiera hacerle "decir" a la mascota institucional.


## Metodos

`transcribir()` · `hablar()`

## Archivos

- `backend/src/modules/ia/ia-voz.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--ia-mensaje|MensajeIa]]
- `reads` → [[table--ia-mensajes|ia.mensajes]]
- `uses` → [[entity--ia-conversacion|ConversacionIa]]
- `reads` → [[table--ia-conversaciones|ia.conversaciones]]
- `uses` → [[service--ia-ia-configuracion|IaConfiguracionService]]
- `uses` → [[service--ia-whisper|WhisperService]]
- `uses` → [[service--ia-piper|PiperService]]

## Referenciado por

- [[api--ia-ia-voz|IaVozController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
