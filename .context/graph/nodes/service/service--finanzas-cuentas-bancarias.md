---
id: service--finanzas-cuentas-bancarias
tipo: SERVICE
nombre: CuentasBancariasService
nivel: L2
dominio: finanzas
resumen: Logica de negocio de cuentas bancarias (modulo finanzas).
capa: backend
archivos:
  - backend/src/modules/finanzas/cuentas-bancarias.service.ts
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--modulo-finanzas]
  - [uses, entity--cuenta-bancaria]
  - [reads, table--finanzas-cuentas-bancarias]
  - [uses, service--seguridad-auditoria]
terminos: [cuentas, bancarias, finanzas, cuenta, bancaria]
---

# CuentasBancariasService

Logica de negocio de cuentas bancarias (modulo finanzas).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()`

## Archivos

- `backend/src/modules/finanzas/cuentas-bancarias.service.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--modulo-finanzas|finanzas (modulo NestJS)]]
- `uses` → [[entity--cuenta-bancaria|CuentaBancaria]]
- `reads` → [[table--finanzas-cuentas-bancarias|finanzas.cuentas_bancarias]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--finanzas-cuentas-bancarias|CuentasBancariasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
