---
id: service--centro-mando-centro-mando
tipo: SERVICE
nombre: CentroMandoService
nivel: L2
dominio: seguridad
resumen: "Centro de mando (spec 2026-10-09 §5): solo las secciones que la persona puede ver, cada una por su lado."
capa: backend
archivos:
  - backend/src/modules/centro-mando/centro-mando.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-centro-mando]
  - [uses, service--pantallas-matriz-web]
  - [uses, service--configuracion-configuracion]
  - [uses, service--despacho-servicio-activo]
  - [uses, service--despacho-despacho]
  - [uses, service--alertas-alertas]
  - [uses, service--flota-disponibilidad]
  - [uses, service--flota-flota]
  - [uses, service--seguridad-perfil]
  - [uses, service--denuncias-denuncias]
  - [uses, service--reservas-reservas]
  - [uses, service--control-personal-vencimientos]
  - [uses, service--sistema-sistema]
terminos: [centro, mando]
---

# CentroMandoService

Centro de mando (spec 2026-10-09 §5): solo las secciones que la persona puede ver, cada una por su lado.


## Metodos

`acceso()` · `panel()`

## Archivos

- `backend/src/modules/centro-mando/centro-mando.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-centro-mando|centro-mando (modulo NestJS)]]
- `uses` → [[service--pantallas-matriz-web|MatrizWebService]]
- `uses` → [[service--configuracion-configuracion|ConfiguracionService]]
- `uses` → [[service--despacho-servicio-activo|ServicioActivoService]]
- `uses` → [[service--despacho-despacho|DespachoService]]
- `uses` → [[service--alertas-alertas|AlertasService]]
- `uses` → [[service--flota-disponibilidad|DisponibilidadService]]
- `uses` → [[service--flota-flota|FlotaService]]
- `uses` → [[service--seguridad-perfil|PerfilService]]
- `uses` → [[service--denuncias-denuncias|DenunciasService]]
- `uses` → [[service--reservas-reservas|ReservasService]]
- `uses` → [[service--control-personal-vencimientos|VencimientosService]]
- `uses` → [[service--sistema-sistema|SistemaService]]

## Referenciado por

- [[api--centro-mando-centro-mando|CentroMandoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
