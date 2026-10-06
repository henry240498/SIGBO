---
id: entity--punto-riesgo
tipo: ENTITY
nombre: PuntoRiesgo
nivel: L1
dominio: servicios
resumen: Establecimiento o lugar de riesgo conocido (migracion 080).
tabla: servicios.puntos_riesgo
archivos:
  - backend/src/shared/entities/punto-riesgo.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-puntos-riesgo]
terminos: [punto, riesgo, puntos, servicios, nivel, bajo, medio, alto, critico]
---

# PuntoRiesgo

Establecimiento o lugar de riesgo conocido (migracion 080).

- **Tabla:** [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]]
- **Columnas mapeadas:** 17

## Estados y enumeraciones

- `NivelRiesgo`: `BAJO` · `MEDIO` · `ALTO` · `CRITICO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/punto-riesgo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
