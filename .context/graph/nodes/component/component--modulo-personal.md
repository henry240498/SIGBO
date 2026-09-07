---
id: component--modulo-personal
tipo: COMPONENT
nombre: personal (modulo NestJS)
nivel: L1
dominio: personal
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de personal.
capa: backend
archivos:
  - backend/src/modules/personal/personal.module.ts
edges:
  - [belongs_to, domain--personal]
terminos: [personal, modulo]
---

# personal (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de personal.


## Entidades registradas (forFeature)

Bombero, BomberoEspecialidad, Especialidad, HistorialCodigo, HistorialInstitucional, CondicionIncorporado, CondicionCombatiente, CondicionApoyoEconomico, CondicionHonorario, ActividadProfesional, IdiomaBombero, VehiculoAutorizado, FojaServicio, Certificacion, Rango, Cargo, Compania, Designacion, Guardia, AsignacionGuardia, TipoServicio, Servicio, PersonalServicio, ActividadAcademica, InscripcionActividadAcademica, TipoBombero, Parametro, SeguroBombero

## Archivos

- `backend/src/modules/personal/personal.module.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]

## Referenciado por

- [[service--personal-actividad-profesional|ActividadProfesionalService]] `uses` →
- [[service--personal-bomberos|BomberosService]] `uses` →
- [[service--personal-condicion|CondicionService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `uses` →
- [[service--personal-idiomas|IdiomasService]] `uses` →
- [[service--personal-seguros-bombero|SegurosBomberoService]] `uses` →
- [[service--personal-tipos-bombero|TiposBomberoService]] `uses` →
- [[rule--reglas-duplicadas-bd-y-codigo|Los invariantes viven en la BD y en el servicio, y hay que cambiar los dos]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
