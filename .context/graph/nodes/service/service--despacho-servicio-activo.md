---
id: service--despacho-servicio-activo
tipo: SERVICE
nombre: ServicioActivoService
nivel: L2
dominio: servicios
resumen: Logica de negocio de servicio activo (modulo despacho).
capa: backend
archivos:
  - backend/src/modules/despacho/servicio-activo.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-despacho]
  - [uses, service--seguridad-auditoria]
  - [uses, service--pantallas-pantallas]
terminos: [servicio, activo, despacho]
---

# ServicioActivoService

Logica de negocio de servicio activo (modulo despacho).


## Metodos

`activos()` · `detalle()` · `unirme()` · `cambiarEstadoParticipacion()` · `mensajes()` · `enviarMensaje()` · `formularios()` · `crearRespuesta()` · `modificarRespuesta()` · `anularRespuesta()` · `historialRespuesta()` · `guardarDefinicion()` · `mapa()`

## Archivos

- `backend/src/modules/despacho/servicio-activo.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-despacho|despacho (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--pantallas-pantallas|PantallasService]]

## Referenciado por

- [[api--despacho-servicio-activo|ServicioActivoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
