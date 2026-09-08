---
id: component--front-guardias
tipo: COMPONENT
nombre: guardias
nivel: L2
dominio: guardias
resumen: "Helper de frontend \"guardias\" (98 exportaciones, consume 28 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/guardias.ts
edges:
  - [calls, api--guardias-guardias]
  - [calls, api--guardias-guardias]
  - [calls, api--guardias-guardias]
  - [calls, api--guardias-guardias]
  - [calls, api--guardias-guardias]
  - [calls, api--guardias-grupos-guardia]
  - [calls, api--guardias-grupos-guardia]
  - [calls, api--guardias-grupos-guardia]
  - [calls, api--guardias-pernoctes]
  - [calls, api--guardias-pernoctes]
  - [calls, api--guardias-pernoctes]
  - [calls, api--guardias-requisitos-rol]
  - [calls, api--guardias-requisitos-rol]
  - [calls, api--guardias-requisitos-rol]
  - [calls, api--guardias-esquemas-horario]
  - [calls, api--guardias-esquemas-horario]
  - [calls, api--guardias-esquemas-horario]
  - [calls, api--organizacion-feriados]
  - [calls, api--organizacion-feriados]
  - [calls, api--organizacion-feriados]
  - [calls, api--guardias-sorteos]
  - [calls, api--guardias-sorteos]
  - [calls, api--guardias-sorteos]
  - [calls, api--guardias-guardias]
  - [calls, api--guardias-ordenes-guardia]
  - [calls, api--guardias-ordenes-guardia]
  - [calls, api--guardias-ordenes-guardia]
  - [calls, api--guardias-ordenes-guardia]
terminos: [guardias, guardia, tipo, participacion, asignacion, cumplimiento, grupo, rol, miembro, pernocte, inspeccion, estacion, novedad, requisito, cargar, item, planificacion, planificar, crear, actualizar, anular, resultado, generacion, generar]
---

# guardias

Helper de frontend "guardias" (98 exportaciones, consume 28 endpoint(s)).


## Archivos

- `frontend/src/lib/guardias.ts`

## Relaciones

- `calls` → [[api--guardias-guardias|GuardiasController]]
- `calls` → [[api--guardias-guardias|GuardiasController]]
- `calls` → [[api--guardias-guardias|GuardiasController]]
- `calls` → [[api--guardias-guardias|GuardiasController]]
- `calls` → [[api--guardias-guardias|GuardiasController]]
- `calls` → [[api--guardias-grupos-guardia|GruposGuardiaController]]
- `calls` → [[api--guardias-grupos-guardia|GruposGuardiaController]]
- `calls` → [[api--guardias-grupos-guardia|GruposGuardiaController]]
- `calls` → [[api--guardias-pernoctes|PernoctesController]]
- `calls` → [[api--guardias-pernoctes|PernoctesController]]
- `calls` → [[api--guardias-pernoctes|PernoctesController]]
- `calls` → [[api--guardias-requisitos-rol|RequisitosRolController]]
- `calls` → [[api--guardias-requisitos-rol|RequisitosRolController]]
- `calls` → [[api--guardias-requisitos-rol|RequisitosRolController]]
- `calls` → [[api--guardias-esquemas-horario|EsquemasHorarioController]]
- `calls` → [[api--guardias-esquemas-horario|EsquemasHorarioController]]
- `calls` → [[api--guardias-esquemas-horario|EsquemasHorarioController]]
- `calls` → [[api--organizacion-feriados|FeriadosController]]
- `calls` → [[api--organizacion-feriados|FeriadosController]]
- `calls` → [[api--organizacion-feriados|FeriadosController]]
- `calls` → [[api--guardias-sorteos|SorteosController]]
- `calls` → [[api--guardias-sorteos|SorteosController]]
- `calls` → [[api--guardias-sorteos|SorteosController]]
- `calls` → [[api--guardias-guardias|GuardiasController]]
- `calls` → [[api--guardias-ordenes-guardia|OrdenesGuardiaController]]
- `calls` → [[api--guardias-ordenes-guardia|OrdenesGuardiaController]]
- `calls` → [[api--guardias-ordenes-guardia|OrdenesGuardiaController]]
- `calls` → [[api--guardias-ordenes-guardia|OrdenesGuardiaController]]

## Referenciado por

- [[screen--dashboard-guardias-esquemas-horario|/dashboard/guardias/esquemas-horario]] `uses` →
- [[screen--dashboard-guardias-generar|/dashboard/guardias/generar]] `uses` →
- [[screen--dashboard-guardias-grupos|/dashboard/guardias/grupos]] `uses` →
- [[screen--dashboard-guardias-grupos-id|/dashboard/guardias/grupos/[id]]] `uses` →
- [[screen--dashboard-guardias-ordenes-configuracion|/dashboard/guardias/ordenes/configuracion]] `uses` →
- [[screen--dashboard-guardias-ordenes-nueva|/dashboard/guardias/ordenes/nueva]] `uses` →
- [[screen--dashboard-guardias-ordenes|/dashboard/guardias/ordenes]] `uses` →
- [[screen--dashboard-guardias-ordenes-id|/dashboard/guardias/ordenes/[id]]] `uses` →
- [[screen--dashboard-guardias|/dashboard/guardias]] `uses` →
- [[screen--dashboard-guardias-pernoctes|/dashboard/guardias/pernoctes]] `uses` →
- [[screen--dashboard-guardias-planificacion|/dashboard/guardias/planificacion]] `uses` →
- [[screen--dashboard-guardias-requisitos|/dashboard/guardias/requisitos]] `uses` →
- [[screen--dashboard-guardias-sorteos|/dashboard/guardias/sorteos]] `uses` →
- [[screen--dashboard-guardias-sorteos-id|/dashboard/guardias/sorteos/[id]]] `uses` →
- [[screen--dashboard-guardias-id|/dashboard/guardias/[id]]] `uses` →
- [[screen--dashboard-organizacion-feriados|/dashboard/organizacion/feriados]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
