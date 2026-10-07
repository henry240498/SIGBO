---
id: entity--tripulacion-movil
tipo: ENTITY
nombre: TripulacionMovil
nivel: L1
dominio: vehiculos
resumen: "Quien va en cada movil y con que funcion (migracion 093). Se carga al tomar la guardia; cada despacho la copia a personal_servicio. Una persona, un movil (UQ_tripm_bombero)."
tabla: vehiculos.tripulacion_movil
archivos:
  - backend/src/shared/entities/tripulacion-movil.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-tripulacion-movil]
terminos: [tripulacion, movil, vehiculos]
---

# TripulacionMovil

Quien va en cada movil y con que funcion (migracion 093). Se carga al tomar la guardia; cada despacho la copia a personal_servicio. Una persona, un movil (UQ_tripm_bombero).

- **Tabla:** [[table--vehiculos-tripulacion-movil|vehiculos.tripulacion_movil]]
- **Columnas mapeadas:** 5

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/tripulacion-movil.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-tripulacion-movil|vehiculos.tripulacion_movil]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
