---
id: service--gre-gre-fuentes
tipo: SERVICE
nombre: GreFuentesService
nivel: L2
dominio: matpel
resumen: Fuente documental interna. El controlador consumidor debe autorizar antes de leer. No acepta rutas del cliente, no hace descargas y no publica archivos estáticos.
capa: backend
archivos:
  - backend/src/modules/gre/gre-fuentes.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
terminos: [gre, fuentes]
---

# GreFuentesService

Fuente documental interna. El controlador consumidor debe autorizar antes de leer. No acepta rutas del cliente, no hace descargas y no publica archivos estáticos.


## Metodos

`leerDocumento()` · `validarReferencia()`

## Archivos

- `backend/src/modules/gre/gre-fuentes.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]

## Referenciado por

- [[service--gre-gre-catalogo|GreCatalogoService]] `uses` →
- [[api--gre-gre-admin|GreAdminController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
