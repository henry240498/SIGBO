---
id: service--guardias-orden-guardia-configuracion
tipo: SERVICE
nombre: OrdenGuardiaConfiguracionService
nivel: L2
dominio: guardias
resumen: "Configuracion institucional de la Orden de Guardia: fila unica, mismo patron que AparienciaService (find({take:1}), si no existe se crea con los defaults de la entidad). Se sembra con el texto real del documento de referencia via migracion; esto solo cubre el caso de una BD nueva sin esa fila."
capa: backend
archivos:
  - backend/src/modules/guardias/orden-guardia-configuracion.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--orden-guardia-configuracion]
  - [reads, table--operaciones-orden-guardia-configuracion]
terminos: [orden, guardia, configuracion, guardias]
---

# OrdenGuardiaConfiguracionService

Configuracion institucional de la Orden de Guardia: fila unica, mismo patron que AparienciaService (find({take:1}), si no existe se crea con los defaults de la entidad). Se sembra con el texto real del documento de referencia via migracion; esto solo cubre el caso de una BD nueva sin esa fila.


## Metodos

`obtener()` · `actualizar()` · `actualizarLogo()`

## Archivos

- `backend/src/modules/guardias/orden-guardia-configuracion.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--orden-guardia-configuracion|OrdenGuardiaConfiguracion]]
- `reads` → [[table--operaciones-orden-guardia-configuracion|operaciones.orden_guardia_configuracion]]

## Referenciado por

- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[api--guardias-ordenes-guardia|OrdenesGuardiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
