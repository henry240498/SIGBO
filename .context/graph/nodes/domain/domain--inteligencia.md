---
id: domain--inteligencia
tipo: DOMAIN
nombre: Inteligencia Artificial
nivel: L0
dominio: inteligencia
estado: ACTIVO
resumen: "Modulo funcional \"Inteligencia Artificial\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [inteligencia, artificial]
---

# Inteligencia Artificial

Modulo funcional "Inteligencia Artificial". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--ia-configuracion|ConfiguracionIa]] `belongs_to` →
- [[entity--ia-conversacion|ConversacionIa]] `belongs_to` →
- [[entity--ia-ejecucion-herramienta|EjecucionHerramientaIa]] `belongs_to` →
- [[entity--ia-historial-configuracion|HistorialConfiguracionIa]] `belongs_to` →
- [[entity--ia-mensaje|MensajeIa]] `belongs_to` →
- [[entity--ia-propuesta-mejora|PropuestaMejoraIa]] `belongs_to` →
- [[table--ia-configuraciones|ia.configuraciones]] `belongs_to` →
- [[table--ia-historial-configuracion|ia.historial_configuracion]] `belongs_to` →
- [[table--ia-conversaciones|ia.conversaciones]] `belongs_to` →
- [[table--ia-mensajes|ia.mensajes]] `belongs_to` →
- [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]] `belongs_to` →
- [[table--ia-propuestas-mejora|ia.propuestas_mejora]] `belongs_to` →
- [[component--modulo-ia|ia (modulo NestJS)]] `belongs_to` →
- [[service--ia-ia-chat|IaChatService]] `belongs_to` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `belongs_to` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `belongs_to` →
- [[service--ia-ia-dashboard|IaDashboardService]] `belongs_to` →
- [[service--ia-ia-motor|IaMotorService]] `belongs_to` →
- [[service--ia-ia-propuestas-mejora|IaPropuestasMejoraService]] `belongs_to` →
- [[service--ia-ia-tools|IaToolsService]] `belongs_to` →
- [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]] `belongs_to` →
- [[api--ia-ia-chat|IaChatController]] `belongs_to` →
- [[api--ia-ia-configuracion|IaConfiguracionController]] `belongs_to` →
- [[api--ia-ia-dashboard|IaDashboardController]] `belongs_to` →
- [[api--ia-ia-propuestas-mejora|IaPropuestasMejoraController]] `belongs_to` →
- [[screen--dashboard-inteligencia|/dashboard/inteligencia]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
