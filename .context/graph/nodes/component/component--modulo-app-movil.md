---
id: component--modulo-app-movil
tipo: COMPONENT
nombre: app-movil (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de app-movil.
capa: backend
archivos:
  - backend/src/modules/app-movil/app-movil.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [movil, modulo]
---

# app-movil (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de app-movil.


## Archivos

- `backend/src/modules/app-movil/app-movil.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--app-movil-app-movil|AppMovilService]] `uses` →
- [[decision--app-movil-offline-primero|La app móvil trabaja sin conexión y sincroniza después]] `constrains` →
- [[decision--reportes-como-texto-plano|Los reportes de errores y sugerencias se guardan como archivos de texto plano en el servidor]] `constrains` →
- [[rule--textos-de-la-app-con-tildes|Los textos visibles de la app llevan tildes y ñ, y se corrigen con el script, no a mano en bloque]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
