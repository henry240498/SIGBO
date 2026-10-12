---
id: service--pantallas-matriz-web
tipo: SERVICE
nombre: MatrizWebService
nivel: L2
dominio: seguridad
resumen: "Matriz de permisos por pantalla aplicada a la web (spec 2026-10-09 §4). Al arrancar: arma la tabla real de rutas de Nest, la cruza con el catalogo generado y sincroniza seguridad.pantallas. En cada pedido (desde PermissionsGuard): si la ruta pertenece a pantallas con reglas para esa persona, decide la matriz. Solo restringe."
capa: backend
archivos:
  - backend/src/modules/pantallas/matriz-web.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-pantallas]
terminos: [matriz, web, pantallas]
---

# MatrizWebService

Matriz de permisos por pantalla aplicada a la web (spec 2026-10-09 §4). Al arrancar: arma la tabla real de rutas de Nest, la cruza con el catalogo generado y sincroniza seguridad.pantallas. En cada pedido (desde PermissionsGuard): si la ruta pertenece a pantallas con reglas para esa persona, decide la matriz. Solo restringe.


## Metodos

`onApplicationBootstrap()` · `sincronizar()` · `estaSincronizada()` · `invalidar()` · `exigirEnRuta()` · `misPermisosWeb()` · `evaluadorSecciones()` · `reglaNiegaVer()` · `vistaPrevia()` · `catalogoParaAdministrar()` · `estado()`

## Archivos

- `backend/src/modules/pantallas/matriz-web.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-pantallas|pantallas (modulo NestJS)]]

## Referenciado por

- [[service--centro-mando-centro-mando|CentroMandoService]] `uses` →
- [[service--sistema-sistema|SistemaService]] `uses` →
- [[api--pantallas-pantallas|PantallasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
