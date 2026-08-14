---
id: component--modulo-guardias
tipo: COMPONENT
nombre: guardias (modulo NestJS)
nivel: L1
dominio: guardias
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de guardias.
capa: backend
archivos:
  - backend/src/modules/guardias/guardias.module.ts
edges:
  - [belongs_to, domain--guardias]
terminos: [guardias, modulo]
---

# guardias (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de guardias.


## Entidades registradas (forFeature)

Guardia, AsignacionGuardia, CambioGuardia, GrupoGuardia, GrupoGuardiaMiembro, Pernocte, InspeccionEstacion, NovedadGuardia, RequisitoRolGuardia, EsquemaHorarioGuardia, Feriado, Rango, SorteoGuardia, SorteoParticipante, InspeccionMovil, Vehiculo, ChecklistItemVehiculo, Equipo, Servicio, EventoAsistencia, ParticipanteEvento, PrestamoEquipo, Bombero, MarcacionAsistencia, Parametro, Usuario, VehiculoAutorizado, OrdenGuardia, OrdenGuardiaConfiguracion, OrdenGuardiaModificacion, Cargo, Designacion

## Archivos

- `backend/src/modules/guardias/guardias.module.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-esquemas-horario|EsquemasHorarioService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `uses` →
- [[service--guardias-sorteos|SorteosService]] `uses` →
- [[rule--guardias-vive-en-operaciones|Guardias es un modulo propio cuyas tablas viven en el esquema operaciones]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
