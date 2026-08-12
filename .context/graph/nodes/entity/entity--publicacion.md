---
id: entity--publicacion
tipo: ENTITY
nombre: Publicacion
nivel: L1
dominio: publicaciones
resumen: Entidad Publicacion, persistida en contenido.publicaciones.
tabla: contenido.publicaciones
archivos:
  - backend/src/shared/entities/publicacion.entity.ts
edges:
  - [belongs_to, domain--publicaciones]
  - [persisted_in, table--contenido-publicaciones]
terminos: [publicacion, publicaciones, contenido]
---

# Publicacion

Entidad Publicacion, persistida en contenido.publicaciones.

- **Tabla:** [[table--contenido-publicaciones|contenido.publicaciones]]
- **Columnas mapeadas:** 11

## Archivos

- `backend/src/shared/entities/publicacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--publicaciones|Publicaciones]]
- `persisted_in` → [[table--contenido-publicaciones|contenido.publicaciones]]

## Referenciado por

- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
