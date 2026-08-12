---
id: entity--tipo-servicio
tipo: ENTITY
nombre: TipoServicio
nivel: L1
dominio: servicios
resumen: Catalogo configurable de tipos de servicio (schema servicios).
tabla: servicios.tipos_servicio
archivos:
  - backend/src/shared/entities/tipo-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-tipos-servicio]
terminos: [tipo, servicio, tipos, servicios]
---

# TipoServicio

Catalogo configurable de tipos de servicio (schema servicios).

- **Tabla:** [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- **Columnas mapeadas:** 11

## Archivos

- `backend/src/shared/entities/tipo-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]

## Referenciado por

- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
