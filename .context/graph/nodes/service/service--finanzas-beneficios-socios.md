---
id: service--finanzas-beneficios-socios
tipo: SERVICE
nombre: BeneficiosSociosService
nivel: L2
dominio: finanzas
resumen: "Descuentos para Socios Protectores (seccion 11 del pedido). Aplica a todo socio con estado activo -- no hay asignacion 1 a 1 socio<->beneficio. El calculo NUNCA modifica el precio base de la actividad/servicio relacionado; cada aplicacion queda auditada en AplicacionBeneficio (secciones 12-13)."
capa: backend
archivos:
  - backend/src/modules/finanzas/beneficios-socios.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--beneficio-socio]
  - [reads, table--finanzas-beneficios-socios]
  - [uses, entity--aplicacion-beneficio]
  - [reads, table--finanzas-aplicaciones-beneficio]
  - [uses, entity--socio-protector]
  - [reads, table--finanzas-socios-protectores]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--seguridad-auditoria]
terminos: [beneficios, socios, finanzas, beneficio, socio, aplicacion, protector, parametro]
---

# BeneficiosSociosService

Descuentos para Socios Protectores (seccion 11 del pedido). Aplica a todo socio con estado activo -- no hay asignacion 1 a 1 socio<->beneficio. El calculo NUNCA modifica el precio base de la actividad/servicio relacionado; cada aplicacion queda auditada en AplicacionBeneficio (secciones 12-13).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `buscarAplicable()` · `aplicar()` · `simular()` · `aplicacionesDe()`

## Archivos

- `backend/src/modules/finanzas/beneficios-socios.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--beneficio-socio|BeneficioSocio]]
- `reads` → [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]]
- `uses` → [[entity--aplicacion-beneficio|AplicacionBeneficio]]
- `reads` → [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]]
- `uses` → [[entity--socio-protector|SocioProtector]]
- `reads` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `uses` →
- [[api--finanzas-beneficios-socios|BeneficiosSociosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
