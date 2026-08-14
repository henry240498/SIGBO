---
id: domain--guardias
tipo: DOMAIN
nombre: Guardias
nivel: L0
dominio: guardias
estado: ACTIVO
resumen: "Modulo funcional \"Guardias\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [guardias]
---

# Guardias

Modulo funcional "Guardias". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[component--modulo-guardias|guardias (modulo NestJS)]] `belongs_to` →
- [[service--guardias-bitacora|BitacoraService]] `belongs_to` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `belongs_to` →
- [[service--guardias-esquemas-horario|EsquemasHorarioService]] `belongs_to` →
- [[service--guardias-generacion|GeneracionService]] `belongs_to` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `belongs_to` →
- [[service--guardias-guardias|GuardiasService]] `belongs_to` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `belongs_to` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `belongs_to` →
- [[service--guardias-novedades|NovedadesService]] `belongs_to` →
- [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]] `belongs_to` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `belongs_to` →
- [[service--guardias-pernoctes|PernoctesService]] `belongs_to` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `belongs_to` →
- [[service--guardias-sorteos|SorteosService]] `belongs_to` →
- [[api--guardias-bitacora|BitacoraController]] `belongs_to` →
- [[api--guardias-esquemas-horario|EsquemasHorarioController]] `belongs_to` →
- [[api--guardias-grupos-guardia|GruposGuardiaController]] `belongs_to` →
- [[api--guardias-guardias|GuardiasController]] `belongs_to` →
- [[api--guardias-inspecciones-estacion|InspeccionesEstacionController]] `belongs_to` →
- [[api--guardias-inspecciones-movil|InspeccionesMovilController]] `belongs_to` →
- [[api--guardias-novedades|NovedadesController]] `belongs_to` →
- [[api--guardias-ordenes-guardia|OrdenesGuardiaController]] `belongs_to` →
- [[api--guardias-pernoctes|PernoctesController]] `belongs_to` →
- [[api--guardias-requisitos-rol|RequisitosRolController]] `belongs_to` →
- [[api--guardias-sorteos|SorteosController]] `belongs_to` →
- [[screen--dashboard-guardias-auditoria|/dashboard/guardias/auditoria]] `belongs_to` →
- [[screen--dashboard-guardias-esquemas-horario|/dashboard/guardias/esquemas-horario]] `belongs_to` →
- [[screen--dashboard-guardias-generar|/dashboard/guardias/generar]] `belongs_to` →
- [[screen--dashboard-guardias-grupos|/dashboard/guardias/grupos]] `belongs_to` →
- [[screen--dashboard-guardias-grupos-id|/dashboard/guardias/grupos/[id]]] `belongs_to` →
- [[screen--dashboard-guardias-ordenes-configuracion|/dashboard/guardias/ordenes/configuracion]] `belongs_to` →
- [[screen--dashboard-guardias-ordenes-nueva|/dashboard/guardias/ordenes/nueva]] `belongs_to` →
- [[screen--dashboard-guardias-ordenes|/dashboard/guardias/ordenes]] `belongs_to` →
- [[screen--dashboard-guardias-ordenes-id|/dashboard/guardias/ordenes/[id]]] `belongs_to` →
- [[screen--dashboard-guardias|/dashboard/guardias]] `belongs_to` →
- [[screen--dashboard-guardias-pernoctes|/dashboard/guardias/pernoctes]] `belongs_to` →
- [[screen--dashboard-guardias-requisitos|/dashboard/guardias/requisitos]] `belongs_to` →
- [[screen--dashboard-guardias-sorteos|/dashboard/guardias/sorteos]] `belongs_to` →
- [[screen--dashboard-guardias-sorteos-id|/dashboard/guardias/sorteos/[id]]] `belongs_to` →
- [[screen--dashboard-guardias-id|/dashboard/guardias/[id]]] `belongs_to` →
- [[rule--elegibilidad-de-rol-guardia|La elegibilidad para un rol de guardia se configura en tablas, con OR entre filas y AND entre columnas]] `belongs_to` →
- [[rule--guardias-vive-en-operaciones|Guardias es un modulo propio cuyas tablas viven en el esquema operaciones]] `belongs_to` →
- [[workflow--guardia-y-pernocte|Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
