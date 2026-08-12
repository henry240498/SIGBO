---
id: domain--publicaciones
tipo: DOMAIN
nombre: Publicaciones
nivel: L0
dominio: publicaciones
estado: ACTIVO
resumen: "Modulo funcional \"Publicaciones\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [publicaciones]
---

# Publicaciones

Modulo funcional "Publicaciones". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--publicacion|Publicacion]] `belongs_to` →
- [[table--contenido-publicaciones|contenido.publicaciones]] `belongs_to` →
- [[component--modulo-publicaciones|publicaciones (modulo NestJS)]] `belongs_to` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `belongs_to` →
- [[api--publicaciones-publicaciones|PublicacionesController]] `belongs_to` →
- [[screen--dashboard-publicaciones|/dashboard/publicaciones]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
