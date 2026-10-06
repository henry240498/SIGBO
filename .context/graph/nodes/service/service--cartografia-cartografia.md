---
id: service--cartografia-cartografia
tipo: SERVICE
nombre: CartografiaService
nivel: L2
dominio: servicios
resumen: Logica de negocio de cartografia (modulo cartografia).
capa: backend
archivos:
  - backend/src/modules/cartografia/cartografia.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-cartografia]
  - [uses, service--seguridad-auditoria]
terminos: [cartografia]
---

# CartografiaService

Logica de negocio de cartografia (modulo cartografia).


## Metodos

`for()` · `listarHidrantes()` · `crearHidrante()` · `actualizarHidrante()` · `listarPuntos()` · `crearPunto()` · `actualizarPunto()` · `preplanVigente()` · `historialPreplan()` · `guardarPreplan()` · `cercanos()`

## Archivos

- `backend/src/modules/cartografia/cartografia.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-cartografia|cartografia (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--cartografia-cartografia|CartografiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
