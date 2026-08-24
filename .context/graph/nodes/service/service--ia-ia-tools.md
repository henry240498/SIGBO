---
id: service--ia-ia-tools
tipo: SERVICE
nombre: IaToolsService
nivel: L2
dominio: inteligencia
resumen: "Registro y ejecucion de las herramientas controladas de Snoopy (secciones 12/45 del pedido): lista blanca fija, cada una verifica permiso ANTES de tocar un repositorio y devuelve solo campos ya minimizados (nunca cedula/telefono/direccion/datos medicos -- seccion 43). Ninguna herramienta modifica datos: todas usan `find`/ `createQueryBuilder` de solo lectura. `patrones`/`palabrasClave` son lo que IaMotorService usa para decidir, sin ningun proveedor externo, cual herramienta corresponde a un mensaje en espanol."
capa: backend
archivos:
  - backend/src/modules/ia/tools/ia-tools.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--marcacion-asistencia]
  - [reads, table--operaciones-marcaciones-asistencia]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--curso-externo-cache]
  - [reads, table--academia-cursos-externos-cache]
  - [uses, entity--movimiento-financiero]
  - [reads, table--finanzas-movimientos-financieros]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--identidad-institucional]
  - [reads, table--organizacion-identidad-institucional]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, entity--tipo-bombero]
  - [reads, table--personal-tipos-bombero]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, service--documentos-documentos]
terminos: [tools, bombero, guardia, asignacion, servicio, vehiculo, equipo, marcacion, asistencia, actividad, academica, curso, externo, cache, movimiento, financiero, articulo, identidad, institucional, parametro, rango, tipo, inscripcion]
---

# IaToolsService

Registro y ejecucion de las herramientas controladas de Snoopy (secciones 12/45 del pedido): lista blanca fija, cada una verifica permiso ANTES de tocar un repositorio y devuelve solo campos ya minimizados (nunca cedula/telefono/direccion/datos medicos -- seccion 43). Ninguna herramienta modifica datos: todas usan `find`/ `createQueryBuilder` de solo lectura. `patrones`/`palabrasClave` son lo que IaMotorService usa para decidir, sin ningun proveedor externo, cual herramienta corresponde a un mensaje en espanol.


## Metodos

`for()` · `herramientasDisponibles()` · `herramientasDelModulo()` · `buscarPorNombre()` · `autorizada()` · `todas()`

## Archivos

- `backend/src/modules/ia/tools/ia-tools.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `reads` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--curso-externo-cache|CursoExternoCache]]
- `reads` → [[table--academia-cursos-externos-cache|academia.cursos_externos_cache]]
- `uses` → [[entity--movimiento-financiero|MovimientoFinanciero]]
- `reads` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--identidad-institucional|IdentidadInstitucional]]
- `reads` → [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[entity--tipo-bombero|TipoBombero]]
- `reads` → [[table--personal-tipos-bombero|personal.tipos_bombero]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[service--documentos-documentos|DocumentosService]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →
- [[service--ia-ia-motor|IaMotorService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
