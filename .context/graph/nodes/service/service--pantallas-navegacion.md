---
id: service--pantallas-navegacion
tipo: SERVICE
nombre: NavegacionService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de navegacion (modulo pantallas).
capa: backend
archivos:
  - backend/src/modules/pantallas/navegacion.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-pantallas]
  - [uses, service--seguridad-auditoria]
terminos: [navegacion, pantallas]
---

# NavegacionService

Logica de negocio de navegacion (modulo pantallas).


## Metodos

`if()` · `if()` · `registrar()` · `lineaDeUsuario()`

## Archivos

- `backend/src/modules/pantallas/navegacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-pantallas|pantallas (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--pantallas-pantallas|PantallasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
