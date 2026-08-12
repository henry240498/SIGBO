---
id: entity--checklist-item-vehiculo
tipo: ENTITY
nombre: ChecklistItemVehiculo
nivel: L1
dominio: vehiculos
resumen: "Catalogo parametrizable de items de inspeccion de vehiculo (seccion 12 del pedido de Guardias). `tipoVehiculo` NULL significa que el item aplica a todos los tipos. Consumido por el checklist de Condicion de Moviles dentro de una guardia (Fase 4)."
tabla: vehiculos.checklist_items
archivos:
  - backend/src/shared/entities/checklist-item-vehiculo.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-checklist-items]
terminos: [checklist, item, vehiculo, items, vehiculos, categoria, mecanica, equipamiento, otro]
---

# ChecklistItemVehiculo

Catalogo parametrizable de items de inspeccion de vehiculo (seccion 12 del pedido de Guardias). `tipoVehiculo` NULL significa que el item aplica a todos los tipos. Consumido por el checklist de Condicion de Moviles dentro de una guardia (Fase 4).

- **Tabla:** [[table--vehiculos-checklist-items|vehiculos.checklist_items]]
- **Columnas mapeadas:** 5

## Estados y enumeraciones

- `CategoriaChecklistItemVehiculo`: `MECANICA` · `EQUIPAMIENTO` · `OTRO`

## Archivos

- `backend/src/shared/entities/checklist-item-vehiculo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-checklist-items|vehiculos.checklist_items]]

## Referenciado por

- [[service--vehiculos-checklist-items|ChecklistItemsService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
