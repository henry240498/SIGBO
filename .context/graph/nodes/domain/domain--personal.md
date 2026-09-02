---
id: domain--personal
tipo: DOMAIN
nombre: Personal
nivel: L0
dominio: personal
estado: ACTIVO
resumen: "Modulo funcional \"Personal\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [personal]
---

# Personal

Modulo funcional "Personal". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--actividad-profesional|ActividadProfesional]] `belongs_to` →
- [[entity--bombero-especialidad|BomberoEspecialidad]] `belongs_to` →
- [[entity--bombero|Bombero]] `belongs_to` →
- [[entity--certificacion|Certificacion]] `belongs_to` →
- [[entity--condicion-apoyo-economico|CondicionApoyoEconomico]] `belongs_to` →
- [[entity--condicion-combatiente|CondicionCombatiente]] `belongs_to` →
- [[entity--condicion-honorario|CondicionHonorario]] `belongs_to` →
- [[entity--condicion-incorporado|CondicionIncorporado]] `belongs_to` →
- [[entity--foja-servicio|FojaServicio]] `belongs_to` →
- [[entity--historial-codigo|HistorialCodigo]] `belongs_to` →
- [[entity--historial-institucional|HistorialInstitucional]] `belongs_to` →
- [[entity--idioma-bombero|IdiomaBombero]] `belongs_to` →
- [[entity--seguro-bombero|SeguroBombero]] `belongs_to` →
- [[entity--tipo-bombero|TipoBombero]] `belongs_to` →
- [[entity--vehiculo-autorizado|VehiculoAutorizado]] `belongs_to` →
- [[table--personal-bomberos|personal.bomberos]] `belongs_to` →
- [[table--personal-certificaciones|personal.certificaciones]] `belongs_to` →
- [[table--personal-licencias|personal.licencias]] `belongs_to` →
- [[table--personal-historial-medico|personal.historial_medico]] `belongs_to` →
- [[table--personal-historial-disciplinario|personal.historial_disciplinario]] `belongs_to` →
- [[table--personal-bombero-especialidades|personal.bombero_especialidades]] `belongs_to` →
- [[table--personal-historial-codigo|personal.historial_codigo]] `belongs_to` →
- [[table--personal-condicion-incorporado|personal.condicion_incorporado]] `belongs_to` →
- [[table--personal-condicion-combatiente|personal.condicion_combatiente]] `belongs_to` →
- [[table--personal-condicion-apoyo-economico|personal.condicion_apoyo_economico]] `belongs_to` →
- [[table--personal-condicion-honorario|personal.condicion_honorario]] `belongs_to` →
- [[table--personal-historial-institucional|personal.historial_institucional]] `belongs_to` →
- [[table--personal-actividad-profesional|personal.actividad_profesional]] `belongs_to` →
- [[table--personal-idiomas-bombero|personal.idiomas_bombero]] `belongs_to` →
- [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]] `belongs_to` →
- [[table--personal-fojas-servicio|personal.fojas_servicio]] `belongs_to` →
- [[table--personal-tipos-bombero|personal.tipos_bombero]] `belongs_to` →
- [[table--personal-seguros-bombero|personal.seguros_bombero]] `belongs_to` →
- [[component--modulo-personal|personal (modulo NestJS)]] `belongs_to` →
- [[service--personal-actividad-profesional|ActividadProfesionalService]] `belongs_to` →
- [[service--personal-bomberos|BomberosService]] `belongs_to` →
- [[service--personal-condicion|CondicionService]] `belongs_to` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `belongs_to` →
- [[service--personal-especialidades-bombero|EspecialidadesBomberoService]] `belongs_to` →
- [[service--personal-foja-servicio|FojaServicioService]] `belongs_to` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `belongs_to` →
- [[service--personal-idiomas|IdiomasService]] `belongs_to` →
- [[service--personal-seguros-bombero|SegurosBomberoService]] `belongs_to` →
- [[service--personal-tipos-bombero|TiposBomberoService]] `belongs_to` →
- [[api--personal-actividad-profesional|ActividadProfesionalController]] `belongs_to` →
- [[api--personal-bomberos|BomberosController]] `belongs_to` →
- [[api--personal-condicion|CondicionController]] `belongs_to` →
- [[api--personal-consultas-cruzadas|ConsultasCruzadasController]] `belongs_to` →
- [[api--personal-especialidades-bombero|EspecialidadesBomberoController]] `belongs_to` →
- [[api--personal-foja-servicio|FojaServicioController]] `belongs_to` →
- [[api--personal-historial-institucional|HistorialInstitucionalController]] `belongs_to` →
- [[api--personal-idiomas|IdiomasController]] `belongs_to` →
- [[api--personal-seguros-bombero|SegurosBomberoController]] `belongs_to` →
- [[api--personal-tipos-bombero|TiposBomberoController]] `belongs_to` →
- [[screen--dashboard-personal-nuevo|/dashboard/personal/nuevo]] `belongs_to` →
- [[screen--dashboard-personal|/dashboard/personal]] `belongs_to` →
- [[screen--dashboard-personal-id|/dashboard/personal/[id]]] `belongs_to` →
- [[rule--cedula-y-numero-bombero-unicos|Cedula y numero de bombero son unicos en toda la institucion]] `belongs_to` →
- [[rule--expediente-una-seccion-un-archivo|El expediente del bombero es una seccion por archivo]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
