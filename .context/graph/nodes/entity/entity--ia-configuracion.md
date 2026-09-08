---
id: entity--ia-configuracion
tipo: ENTITY
nombre: ConfiguracionIa
nivel: L1
dominio: inteligencia
resumen: "Configuracion del asistente institucional (fila unica por institucion, mismo patron que IdentidadInstitucional/ConfiguracionSistema -- hoy una sola fila porque SIGBO no tiene institucion_id real todavia). \"Snoopy\" es simplemente el valor actual de `nombre`/`personaje`: nada del backend asume ese nombre (seccion 1-2 del pedido). `modulosHabilitadosJson` es una restriccion ADICIONAL sobre los permisos del usuario, no un reemplazo: una herramienta solo se ejecuta si el modulo esta habilitado aqui Y el usuario tiene el permiso especifico (seccion 35, \"Modulos consultables\"). \"Roles habilitados\" no tiene columna propia: se resuelve con el permiso `inteligencia:usar` ya asignado por rol -- evita dos fuentes de verdad para lo mismo. Sin `proveedor` de LLM externo: el motor de razonamiento sigue siendo local y deterministico (IaMotorService), nunca un cliente de un proveedor por internet (pivote de arquitectura, ver migracion 060). `limiteActivo` en false es \"sin limites\" tal cual lo pidio la institucion: el limitador de ia-rate-limit.guard.ts es una proteccion tecnica anti-abuso opcional, nunca un presupuesto de costo. Los campos `ollama*` (migracion 072) son la EXCEPCION deliberada y acotada: Ollama corre en la misma red local (tipicamente la misma maquina), nunca sale a internet, y solo se usa para (a) sugerir una herramienta cuando el reconocimiento por patrones no encuentra ninguna y (b) redactar en lenguaje mas natural un resultado que SIGBO ya calculo y ya autorizo -- nunca decide que datos se entregan. `ollamaHabilitado` nace en false: no cambia el comportamiento de una instalacion existente sin que un administrador lo prenda a proposito."
tabla: ia.configuraciones
archivos:
  - backend/src/shared/entities/ia-configuracion.entity.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [persisted_in, table--ia-configuraciones]
terminos: [configuracion, configuraciones, formalidad, baja, media, alta, estado, activa, inactiva, mantenimiento]
---

# ConfiguracionIa

Configuracion del asistente institucional (fila unica por institucion, mismo patron que IdentidadInstitucional/ConfiguracionSistema -- hoy una sola fila porque SIGBO no tiene institucion_id real todavia). "Snoopy" es simplemente el valor actual de `nombre`/`personaje`: nada del backend asume ese nombre (seccion 1-2 del pedido). `modulosHabilitadosJson` es una restriccion ADICIONAL sobre los permisos del usuario, no un reemplazo: una herramienta solo se ejecuta si el modulo esta habilitado aqui Y el usuario tiene el permiso especifico (seccion 35, "Modulos consultables"). "Roles habilitados" no tiene columna propia: se resuelve con el permiso `inteligencia:usar` ya asignado por rol -- evita dos fuentes de verdad para lo mismo. Sin `proveedor` de LLM externo: el motor de razonamiento sigue siendo local y deterministico (IaMotorService), nunca un cliente de un proveedor por internet (pivote de arquitectura, ver migracion 060). `limiteActivo` en false es "sin limites" tal cual lo pidio la institucion: el limitador de ia-rate-limit.guard.ts es una proteccion tecnica anti-abuso opcional, nunca un presupuesto de costo. Los campos `ollama*` (migracion 072) son la EXCEPCION deliberada y acotada: Ollama corre en la misma red local (tipicamente la misma maquina), nunca sale a internet, y solo se usa para (a) sugerir una herramienta cuando el reconocimiento por patrones no encuentra ninguna y (b) redactar en lenguaje mas natural un resultado que SIGBO ya calculo y ya autorizo -- nunca decide que datos se entregan. `ollamaHabilitado` nace en false: no cambia el comportamiento de una instalacion existente sin que un administrador lo prenda a proposito.

- **Tabla:** [[table--ia-configuraciones|ia.configuraciones]]
- **Columnas mapeadas:** 40

## Estados y enumeraciones

- `FormalidadIa`: `BAJA` · `MEDIA` · `ALTA`
- `EstadoConfiguracionIa`: `ACTIVA` · `INACTIVA` · `MANTENIMIENTO`

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaChatController, IaConfiguracionController
- **Servicios:** IaConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ia-configuracion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `persisted_in` → [[table--ia-configuraciones|ia.configuraciones]]

## Referenciado por

- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
