---
id: component--front-personal
tipo: COMPONENT
nombre: personal
nivel: L2
dominio: personal
resumen: "Helper de frontend \"personal\" (13 exportaciones, consume 3 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/personal.ts
edges:
  - [calls, api--personal-tipos-bombero]
  - [calls, api--equipos-equipamiento-bombero]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [personal, tipo, bombero, resumen, estados, cargar, tipos, bomberos, construir, extraer, numero, codigo, comparar, institucional, catalogo, subir, firma, digital, eliminar, cambiar, autorizacion]
---

# personal

Helper de frontend "personal" (13 exportaciones, consume 3 endpoint(s)).


## Archivos

- `frontend/src/lib/personal.ts`

## Relaciones

- `calls` → [[api--personal-tipos-bombero|TiposBomberoController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

## Referenciado por

- [[screen--dashboard-academia-id|/dashboard/academia/[id]]] `uses` →
- [[screen--dashboard-asistencia-eventos-id|/dashboard/asistencia/eventos/[id]]] `uses` →
- [[screen--dashboard-asistencia-registro|/dashboard/asistencia/registro]] `uses` →
- [[screen--dashboard-deposito-articulos-id|/dashboard/deposito/articulos/[id]]] `uses` →
- [[screen--dashboard-deposito-bajas|/dashboard/deposito/bajas]] `uses` →
- [[screen--dashboard-deposito-inventarios-fisicos|/dashboard/deposito/inventarios-fisicos]] `uses` →
- [[screen--dashboard-deposito-mantenimientos|/dashboard/deposito/mantenimientos]] `uses` →
- [[screen--dashboard-deposito-movimientos|/dashboard/deposito/movimientos]] `uses` →
- [[screen--dashboard-deposito-prestamos|/dashboard/deposito/prestamos]] `uses` →
- [[screen--dashboard-deposito-ubicaciones|/dashboard/deposito/ubicaciones]] `uses` →
- [[screen--dashboard-documentos-plantillas|/dashboard/documentos/plantillas]] `uses` →
- [[screen--dashboard-documentos-id|/dashboard/documentos/[id]]] `uses` →
- [[screen--dashboard-equipos-id|/dashboard/equipos/[id]]] `uses` →
- [[screen--dashboard-finanzas-cajas|/dashboard/finanzas/cajas]] `uses` →
- [[screen--dashboard-finanzas-cuentas-bancarias|/dashboard/finanzas/cuentas-bancarias]] `uses` →
- [[screen--dashboard-finanzas-cuotas|/dashboard/finanzas/cuotas]] `uses` →
- [[screen--dashboard-finanzas-movimientos|/dashboard/finanzas/movimientos]] `uses` →
- [[screen--dashboard-finanzas-socios-protectores|/dashboard/finanzas/socios-protectores]] `uses` →
- [[screen--dashboard-guardias-grupos|/dashboard/guardias/grupos]] `uses` →
- [[screen--dashboard-guardias-grupos-id|/dashboard/guardias/grupos/[id]]] `uses` →
- [[screen--dashboard-guardias-ordenes-configuracion|/dashboard/guardias/ordenes/configuracion]] `uses` →
- [[screen--dashboard-guardias-pernoctes|/dashboard/guardias/pernoctes]] `uses` →
- [[screen--dashboard-guardias-requisitos|/dashboard/guardias/requisitos]] `uses` →
- [[screen--dashboard-guardias-id|/dashboard/guardias/[id]]] `uses` →
- [[screen--dashboard-personal|/dashboard/personal]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
