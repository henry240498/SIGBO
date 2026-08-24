---
id: service--ia-ia-motor
tipo: SERVICE
nombre: IaMotorService
nivel: L2
dominio: inteligencia
resumen: "Motor de razonamiento LOCAL de Snoopy: sin llamadas salientes, sin agente externo, sin \"tokens\" (pivote de arquitectura pedido por la institucion). Reconoce intencion por patrones/palabras clave en espanol, ejecuta como MAXIMO una herramienta de la lista blanca por turno y arma la respuesta con plantillas ajustadas al tono configurado. Es deterministico: mismo mensaje, mismos permisos -> misma respuesta. No entiende parafraseo arbitrario -- cubre las formas de pregunta mas comunes en espanol para cada tema, documentado como limitacion real."
capa: backend
archivos:
  - backend/src/modules/ia/ia-motor.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, service--ia-ia-tools]
terminos: [motor]
---

# IaMotorService

Motor de razonamiento LOCAL de Snoopy: sin llamadas salientes, sin agente externo, sin "tokens" (pivote de arquitectura pedido por la institucion). Reconoce intencion por patrones/palabras clave en espanol, ejecuta como MAXIMO una herramienta de la lista blanca por turno y arma la respuesta con plantillas ajustadas al tono configurado. Es deterministico: mismo mensaje, mismos permisos -> misma respuesta. No entiende parafraseo arbitrario -- cubre las formas de pregunta mas comunes en espanol para cada tema, documentado como limitacion real.


## Metodos

`procesar()`

## Archivos

- `backend/src/modules/ia/ia-motor.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[service--ia-ia-tools|IaToolsService]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
