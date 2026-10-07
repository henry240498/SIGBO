---
id: entity--incidente
tipo: ENTITY
nombre: IncidenteEvento
nivel: L1
dominio: servicios
resumen: "Bitacora unica del incidente: una accion = un evento. Inmutable (disparador en la base)."
tabla: servicios.incidente_eventos
archivos:
  - backend/src/shared/entities/incidente.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-incidente-eventos]
terminos: [incidente, evento, eventos, servicios, fase, operativa, recibido, evaluacion, despachado, camino, lugar, operando, controlado, retorno, disponible, cerrado, resultado, resuelto, falsa, alarma, cancelado, derivado, atendido, acceso, intervencion, tipo, servicio, llamado, vinculado, cambiada, prioridad, movil, salio, llego, retorna, despacho, tripulacion, ajustada, personal, sumado]
---

# IncidenteEvento

Bitacora unica del incidente: una accion = un evento. Inmutable (disparador en la base).

- **Tabla:** [[table--servicios-incidente-eventos|servicios.incidente_eventos]]
- **Columnas mapeadas:** 45

## Estados y enumeraciones

- `FaseOperativa`: `RECIBIDO` · `EVALUACION` · `DESPACHADO` · `EN_CAMINO` · `EN_LUGAR` · `OPERANDO` · `CONTROLADO` · `RETORNO` · `DISPONIBLE` · `CERRADO`
- `ResultadoIncidente`: `CONTROLADO` · `RESUELTO` · `FALSA_ALARMA` · `CANCELADO` · `DERIVADO` · `NO_ATENDIDO` · `SIN_ACCESO` · `SIN_INTERVENCION`
- `TipoEventoIncidente`: `SERVICIO_RECIBIDO` · `LLAMADO_VINCULADO` · `FASE_CAMBIADA` · `PRIORIDAD_CAMBIADA` · `MOVIL_DESPACHADO` · `MOVIL_SALIO` · `MOVIL_LLEGO` · `MOVIL_RETORNA` · `MOVIL_DISPONIBLE` · `DESPACHO_CANCELADO` · `TRIPULACION_AJUSTADA` · `PERSONAL_SUMADO` · `COMANDO_ASUMIDO` · `SITUACION_MARCADA` · `SITUACION_RESUELTA` · `RECURSO_SOLICITADO` · `RECURSO_ACTUALIZADO` · `VICTIMA_REGISTRADA` · `FOTO_TOMADA` · `MENSAJE` · `COMUNICACION` · `EMERGENCIA` · `EMERGENCIA_ATENDIDA` · `RESULTADO_DECLARADO` · `INCIDENTE_CERRADO` · `PERSONAL_ENTRA_ZONA` · `PERSONAL_SALE_ZONA` · `RECUENTO_PERSONAL`
- `OrigenEvento`: `WEB` · `APP` · `SISTEMA`
- `GrupoCondicion`: `SITUACION` · `RIESGO`
- `CategoriaRecurso`: `MOVIL` · `PERSONAL` · `INSUMO` · `EXTERNO` · `OTRO`
- `PrioridadSolicitud`: `NORMAL` · `URGENTE`
- `EstadoSolicitudRecurso`: `SOLICITADO` · `APROBADO` · `DESPACHADO` · `EN_CAMINO` · `EN_USO` · `LIBERADO` · `RECHAZADO` · `CANCELADO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/incidente.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-incidente-eventos|servicios.incidente_eventos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
