---
id: component--front-ia
tipo: COMPONENT
nombre: ia
nivel: L2
resumen: "Helper de frontend \"ia\" (42 exportaciones, consume 17 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/ia.ts
edges:
  - [calls, api--ia-ia-chat]
  - [calls, api--ia-ia-chat]
  - [calls, api--ia-ia-chat]
  - [calls, api--ia-ia-chat]
  - [calls, api--ia-ia-configuracion]
  - [calls, api--ia-ia-configuracion]
  - [calls, api--ia-ia-configuracion]
  - [calls, api--ia-ia-admin-conversaciones]
  - [calls, api--ia-ia-admin-conversaciones]
  - [calls, api--ia-ia-admin-conversaciones]
  - [calls, api--ia-ia-dashboard]
  - [calls, api--ia-ia-dashboard]
  - [calls, api--ia-ia-configuracion]
  - [calls, api--ia-ia-admin-conversaciones]
  - [calls, api--ia-ia-propuestas-mejora]
  - [calls, api--ia-ia-propuestas-mejora]
  - [calls, api--ia-ia-propuestas-mejora]
terminos: [formalidad, estado, configuracion, rol, mensaje, resultado, propuesta, perfil, fuente, citada, respuesta, chat, conversacion, admin, ejecucion, herramienta, mejora, historial, indicadores, uso, registro, auditoria, cargar, enviar]
---

# ia

Helper de frontend "ia" (42 exportaciones, consume 17 endpoint(s)).


## Archivos

- `frontend/src/lib/ia.ts`

## Relaciones

- `calls` → [[api--ia-ia-chat|IaChatController]]
- `calls` → [[api--ia-ia-chat|IaChatController]]
- `calls` → [[api--ia-ia-chat|IaChatController]]
- `calls` → [[api--ia-ia-chat|IaChatController]]
- `calls` → [[api--ia-ia-configuracion|IaConfiguracionController]]
- `calls` → [[api--ia-ia-configuracion|IaConfiguracionController]]
- `calls` → [[api--ia-ia-configuracion|IaConfiguracionController]]
- `calls` → [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]]
- `calls` → [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]]
- `calls` → [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]]
- `calls` → [[api--ia-ia-dashboard|IaDashboardController]]
- `calls` → [[api--ia-ia-dashboard|IaDashboardController]]
- `calls` → [[api--ia-ia-configuracion|IaConfiguracionController]]
- `calls` → [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]]
- `calls` → [[api--ia-ia-propuestas-mejora|IaPropuestasMejoraController]]
- `calls` → [[api--ia-ia-propuestas-mejora|IaPropuestasMejoraController]]
- `calls` → [[api--ia-ia-propuestas-mejora|IaPropuestasMejoraController]]

## Referenciado por

- [[screen--dashboard-inteligencia|/dashboard/inteligencia]] `uses` →
- [[screen--dashboard-seguridad-inteligencia-artificial-auditoria|/dashboard/seguridad/inteligencia-artificial/auditoria]] `uses` →
- [[screen--dashboard-seguridad-inteligencia-artificial-configuracion|/dashboard/seguridad/inteligencia-artificial/configuracion]] `uses` →
- [[screen--dashboard-seguridad-inteligencia-artificial-conversaciones|/dashboard/seguridad/inteligencia-artificial/conversaciones]] `uses` →
- [[screen--dashboard-seguridad-inteligencia-artificial|/dashboard/seguridad/inteligencia-artificial]] `uses` →
- [[screen--dashboard-seguridad-inteligencia-artificial-propuestas|/dashboard/seguridad/inteligencia-artificial/propuestas]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
