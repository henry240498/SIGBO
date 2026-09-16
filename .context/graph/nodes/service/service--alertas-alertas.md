---
id: service--alertas-alertas
tipo: SERVICE
nombre: AlertasService
nivel: L2
dominio: servicios
resumen: Logica de negocio de alertas (modulo alertas).
capa: backend
archivos:
  - backend/src/modules/alertas/alertas.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-alertas]
  - [uses, entity--alerta-emergencia]
  - [reads, table--servicios-alertas-emergencia]
  - [uses, service--seguridad-auditoria]
terminos: [alertas, alerta, emergencia]
---

# AlertasService

Logica de negocio de alertas (modulo alertas).


## Metodos

`if()` · `observarEventos()` · `crear()` · `listar()` · `obtener()` · `cambiarEstado()`

## Archivos

- `backend/src/modules/alertas/alertas.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-alertas|alertas (modulo NestJS)]]
- `uses` → [[entity--alerta-emergencia|AlertaEmergencia]]
- `reads` → [[table--servicios-alertas-emergencia|servicios.alertas_emergencia]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--alertas-alertas|AlertasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
