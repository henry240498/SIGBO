---
id: service--pantallas-pantallas
tipo: SERVICE
nombre: PantallasService
nivel: L2
dominio: seguridad
resumen: "Matriz de permisos por pantalla. Complementa a los permisos por rol: no los reemplaza. Todo se decide ACA, en el backend; la app solo oculta lo que ya sabe que no se puede."
capa: backend
archivos:
  - backend/src/modules/pantallas/pantallas.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-pantallas]
  - [uses, service--seguridad-auditoria]
terminos: [pantallas]
---

# PantallasService

Matriz de permisos por pantalla. Complementa a los permisos por rol: no los reemplaza. Todo se decide ACA, en el backend; la app solo oculta lo que ya sabe que no se puede.


## Metodos

`sujeto()` · `reglas()` · `decision()` · `permite()` · `exigir()` · `misPermisos()` · `listarPantallas()` · `listarReglas()` · `sujetos()` · `guardarRegla()` · `eliminarRegla()`

## Archivos

- `backend/src/modules/pantallas/pantallas.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-pantallas|pantallas (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--despacho-servicio-activo|ServicioActivoService]] `uses` →
- [[api--pantallas-pantallas|PantallasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
