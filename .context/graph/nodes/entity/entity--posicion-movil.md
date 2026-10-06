---
id: entity--posicion-movil
tipo: ENTITY
nombre: PosicionMovil
nivel: L1
dominio: vehiculos
resumen: "Ultima posicion conocida de un movil (migracion 078): una fila por movil."
tabla: vehiculos.posicion_actual
archivos:
  - backend/src/shared/entities/posicion-movil.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-posicion-actual]
terminos: [posicion, movil, actual, vehiculos]
---

# PosicionMovil

Ultima posicion conocida de un movil (migracion 078): una fila por movil.

- **Tabla:** [[table--vehiculos-posicion-actual|vehiculos.posicion_actual]]
- **Columnas mapeadas:** 7

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/posicion-movil.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-posicion-actual|vehiculos.posicion_actual]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
