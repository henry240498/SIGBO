---
id: service--despacho-despacho
tipo: SERVICE
nombre: DespachoService
nivel: L2
dominio: servicios
resumen: Logica de negocio de despacho (modulo despacho).
capa: backend
archivos:
  - backend/src/modules/despacho/despacho.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-despacho]
  - [uses, service--seguridad-auditoria]
  - [uses, service--seguridad-policy-engine]
terminos: [despacho]
---

# DespachoService

Logica de negocio de despacho (modulo despacho).


## Metodos

`miDisponibilidad()` · `cambiarDisponibilidad()` · `guardarHorarios()` · `agregarExcepcion()` · `quitarExcepcion()` · `latido()` · `crearSolicitud()` · `confirmarRecepcion()` · `responder()` · `ampliar()` · `unirmeAmpliacion()` · `cerrar()` · `detalle()` · `linea()` · `listar()` · `misSolicitudes()`

## Archivos

- `backend/src/modules/despacho/despacho.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-despacho|despacho (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--seguridad-policy-engine|PolicyEngineService]]

## Referenciado por

- [[api--despacho-despacho|DespachoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
