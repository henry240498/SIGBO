---
id: entity--dotacion-movil
tipo: ENTITY
nombre: DotacionMovil
nivel: L1
dominio: vehiculos
resumen: Lo que un movil debe llevar y lo hallado en el ultimo control (migracion 081).
tabla: vehiculos.dotacion_movil
archivos:
  - backend/src/shared/entities/dotacion-movil.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-dotacion-movil]
terminos: [dotacion, movil, vehiculos]
---

# DotacionMovil

Lo que un movil debe llevar y lo hallado en el ultimo control (migracion 081).

- **Tabla:** [[table--vehiculos-dotacion-movil|vehiculos.dotacion_movil]]
- **Columnas mapeadas:** 8

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/dotacion-movil.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-dotacion-movil|vehiculos.dotacion_movil]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
