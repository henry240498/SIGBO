---
id: entity--convocatoria
tipo: ENTITY
nombre: Convocatoria
nivel: L1
dominio: servicios
resumen: "Convocatoria al personal (migracion 079): un mensaje y las respuestas de cada bombero. Informa y registra; no obliga a nadie."
tabla: servicios.convocatorias
archivos:
  - backend/src/shared/entities/convocatoria.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-convocatorias]
terminos: [convocatoria, convocatorias, servicios, estado, abierta, cerrada, respuesta, voy, puedo, accion, aceptar, rechazar, cambiar, camino, cancelar, asistencia, llegar]
---

# Convocatoria

Convocatoria al personal (migracion 079): un mensaje y las respuestas de cada bombero. Informa y registra; no obliga a nadie.

- **Tabla:** [[table--servicios-convocatorias|servicios.convocatorias]]
- **Columnas mapeadas:** 23

## Estados y enumeraciones

- `EstadoConvocatoria`: `ABIERTA` · `CERRADA`
- `RespuestaConvocatoria`: `VOY` · `NO_PUEDO`
- `AccionRespuestaConvocatoria`: `ACEPTAR` · `RECHAZAR` · `CAMBIAR_RESPUESTA` · `EN_CAMINO` · `CANCELAR_ASISTENCIA` · `LLEGAR`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/convocatoria.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-convocatorias|servicios.convocatorias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
