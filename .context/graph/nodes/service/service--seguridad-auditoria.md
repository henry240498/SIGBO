---
id: service--seguridad-auditoria
tipo: SERVICE
nombre: AuditoriaService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de auditoria (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/auditoria.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--log-auditoria]
  - [reads, table--seguridad-logs-auditoria]
terminos: [auditoria, seguridad, log]
---

# AuditoriaService

Logica de negocio de auditoria (modulo seguridad).


## Metodos

`registrar()` · `findAll()` · `findRecientes()` · `findPorUsuario()`

## Archivos

- `backend/src/modules/seguridad/auditoria.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--log-auditoria|LogAuditoria]]
- `reads` → [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]]

## Referenciado por

- [[service--auth-auth|AuthService]] `uses` →
- [[service--configuracion-configuracion|ConfiguracionService]] `uses` →
<<<<<<< Updated upstream
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
=======
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-guardias|GuardiasService]] `uses` →
>>>>>>> Stashed changes
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[service--personal-bomberos|BomberosService]] `uses` →
- [[service--seguridad-dashboard|DashboardService]] `uses` →
- [[service--seguridad-permisos|PermisosService]] `uses` →
- [[service--seguridad-roles|RolesService]] `uses` →
- [[service--seguridad-usuarios|UsuariosService]] `uses` →
- [[api--seguridad-auditoria|AuditoriaController]] `exposes` →
- [[api--seguridad-sesiones|SesionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
