---
id: entity--aptitud
tipo: ENTITY
nombre: Aptitud
nivel: L1
dominio: personal
resumen: Aptitud con vencimiento de un bombero (carnet de salud, vacuna, licencia...). Migracion 082.
tabla: personal.aptitudes
archivos:
  - backend/src/shared/entities/aptitud.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-aptitudes]
terminos: [aptitud, aptitudes, personal, categoria, medica, licencia, otra]
---

# Aptitud

Aptitud con vencimiento de un bombero (carnet de salud, vacuna, licencia...). Migracion 082.

- **Tabla:** [[table--personal-aptitudes|personal.aptitudes]]
- **Columnas mapeadas:** 8

## Estados y enumeraciones

- `CategoriaAptitud`: `MEDICA` · `LICENCIA` · `OTRA`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/aptitud.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-aptitudes|personal.aptitudes]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
