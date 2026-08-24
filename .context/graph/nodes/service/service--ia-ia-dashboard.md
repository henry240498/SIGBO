---
id: service--ia-ia-dashboard
tipo: SERVICE
nombre: IaDashboardService
nivel: L2
dominio: inteligencia
resumen: "Indicadores de monitoreo (secciones 47/56 del pedido). Todo calculado en el momento a partir de ia.mensajes/ia.ejecuciones_herramientas -- mismo criterio que el resto de SIGBO: nunca se guarda un total precalculado que pueda desincronizarse. Sin tokens/costo: el motor de razonamiento es local, no hay proveedor externo que facture (pivote de arquitectura). El indicador de \"uso\" pasa a ser por herramienta, que es informacion real y util para decidir que temas consulta mas la gente."
capa: backend
archivos:
  - backend/src/modules/ia/ia-dashboard.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--ia-mensaje]
  - [reads, table--ia-mensajes]
  - [uses, entity--ia-conversacion]
  - [reads, table--ia-conversaciones]
  - [uses, entity--ia-ejecucion-herramienta]
  - [reads, table--ia-ejecuciones-herramientas]
terminos: [mensaje, conversacion, ejecucion, herramienta]
---

# IaDashboardService

Indicadores de monitoreo (secciones 47/56 del pedido). Todo calculado en el momento a partir de ia.mensajes/ia.ejecuciones_herramientas -- mismo criterio que el resto de SIGBO: nunca se guarda un total precalculado que pueda desincronizarse. Sin tokens/costo: el motor de razonamiento es local, no hay proveedor externo que facture (pivote de arquitectura). El indicador de "uso" pasa a ser por herramienta, que es informacion real y util para decidir que temas consulta mas la gente.


## Metodos

`indicadores()` · `usoPorHerramienta()`

## Archivos

- `backend/src/modules/ia/ia-dashboard.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--ia-mensaje|MensajeIa]]
- `reads` → [[table--ia-mensajes|ia.mensajes]]
- `uses` → [[entity--ia-conversacion|ConversacionIa]]
- `reads` → [[table--ia-conversaciones|ia.conversaciones]]
- `uses` → [[entity--ia-ejecucion-herramienta|EjecucionHerramientaIa]]
- `reads` → [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]]

## Referenciado por

- [[api--ia-ia-dashboard|IaDashboardController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
