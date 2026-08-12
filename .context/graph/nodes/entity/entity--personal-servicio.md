---
id: entity--personal-servicio
tipo: ENTITY
nombre: PersonalServicio
nivel: L1
dominio: servicios
resumen: Personal que participo en un servicio (schema servicios).
tabla: servicios.personal_servicio
archivos:
  - backend/src/shared/entities/personal-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-personal-servicio]
terminos: [personal, servicio, servicios]
---

# PersonalServicio

Personal que participo en un servicio (schema servicios).

- **Tabla:** [[table--servicios-personal-servicio|servicios.personal_servicio]]
- **Columnas mapeadas:** 5

## Archivos

- `backend/src/shared/entities/personal-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-personal-servicio|servicios.personal_servicio]]

## Referenciado por

- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
