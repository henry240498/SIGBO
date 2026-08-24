---
id: service--deposito-proveedores
tipo: SERVICE
nombre: ProveedoresService
nivel: L2
dominio: deposito
resumen: Logica de negocio de proveedores (modulo deposito).
capa: backend
archivos:
  - backend/src/modules/deposito/proveedores.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--proveedor-deposito]
  - [reads, table--deposito-proveedores]
  - [uses, service--seguridad-auditoria]
terminos: [proveedores, deposito, proveedor]
---

# ProveedoresService

Logica de negocio de proveedores (modulo deposito).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()`

## Archivos

- `backend/src/modules/deposito/proveedores.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--proveedor-deposito|ProveedorDeposito]]
- `reads` → [[table--deposito-proveedores|deposito.proveedores]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--deposito-proveedores|ProveedoresController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
