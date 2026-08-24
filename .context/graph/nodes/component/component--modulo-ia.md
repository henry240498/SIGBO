---
id: component--modulo-ia
tipo: COMPONENT
nombre: ia (modulo NestJS)
nivel: L1
dominio: inteligencia
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de ia.
capa: backend
archivos:
  - backend/src/modules/ia/ia.module.ts
edges:
  - [belongs_to, domain--inteligencia]
terminos: [modulo]
---

# ia (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de ia.


## Entidades registradas (forFeature)

ConfiguracionIa, HistorialConfiguracionIa, ConversacionIa, MensajeIa, EjecucionHerramientaIa, PropuestaMejoraIa, // Entidades de otros modulos que las herramientas de la IA consultan
      // en solo lectura (mismo patron de bajo acoplamiento ya usado en
      // Deposito/Academia/Finanzas/Documentos): nunca se duplican, nunca
      // se escriben desde aca.
      Bombero, Guardia, AsignacionGuardia, Servicio, Vehiculo, Equipo, MarcacionAsistencia, ActividadAcademica, CursoExternoCache, MovimientoFinanciero, Articulo, IdentidadInstitucional, Parametro, Rango, TipoBombero, InscripcionActividadAcademica, Usuario

## Archivos

- `backend/src/modules/ia/ia.module.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `uses` →
- [[service--ia-ia-dashboard|IaDashboardService]] `uses` →
- [[service--ia-ia-motor|IaMotorService]] `uses` →
- [[service--ia-ia-propuestas-mejora|IaPropuestasMejoraService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
