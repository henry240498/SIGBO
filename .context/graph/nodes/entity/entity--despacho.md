---
id: entity--despacho
tipo: ENTITY
nombre: Despacho
nivel: L1
dominio: servicios
resumen: "Despacho de un movil a un servicio (migracion 077): salida, llegada, fin y regreso."
tabla: servicios.despachos
archivos:
  - backend/src/shared/entities/despacho.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-despachos]
terminos: [despacho, despachos, servicios, estado, despachado, servicio, regresando, cerrado, cancelado]
---

# Despacho

Despacho de un movil a un servicio (migracion 077): salida, llegada, fin y regreso.

- **Tabla:** [[table--servicios-despachos|servicios.despachos]]
- **Columnas mapeadas:** 13

## Estados y enumeraciones

- `EstadoDespacho`: `DESPACHADO` · `EN_SERVICIO` · `REGRESANDO` · `CERRADO` · `CANCELADO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/despacho.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-despachos|servicios.despachos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
