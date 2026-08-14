---
tipo: DOMAIN
nivel: L1
---

# Dominios funcionales

14 módulos declarados en `frontend/src/lib/modulos.ts`, de los cuales **9 están
habilitados**. Un módulo se muestra si tiene `disponible: true` **y** el usuario tiene
algún permiso con su prefijo — ver [[rule--modulo-visible-por-prefijo]].

## ⚠️ Antes que nada: la trampa de nombres

Tres nombres distintos para cosas que se solapan:

| Capa | Asistencia | Guardias |
|---|---|---|
| Módulo NestJS | `operaciones` | `guardias` |
| Prefijo de permisos | `asistencia:` | `guardias:` |
| Slug de frontend | `asistencia` | `guardias` |
| **Esquema SQL** | **`operaciones`** | **`operaciones`** ← el mismo |

**No existe el prefijo `operaciones:` ni el esquema `guardias`.** Los dos dominios
comparten el esquema `operaciones` (16 tablas entre ambos). Ver
[[rule--guardias-vive-en-operaciones]].

## Los módulos habilitados

### Organización Institucional — 53 permisos

El organigrama y todos sus catálogos. Es el módulo con más permisos porque cada catálogo
tiene sus cuatro operaciones.

Entidades: `Compania`, `Cuartel`, `Brigada`, `Unidad`, `Departamento`, `Cargo`, `Rango`,
`Especialidad`, `Turno`, `TipoGuardia`, `Designacion`, `Ascenso`, `Parametro`.

`organizacion.parametros` es uno de los cuatro mecanismos de parametrización del sistema
— ver [[decision--tolerancias-parametrizables]].

### Personal — 14 permisos · 18 tablas, el esquema más grande

El expediente de cada bombero.

Entidades: `Bombero`, `TipoBombero`, `ActividadProfesional`, `BomberoEspecialidad`,
`Certificacion`, `IdiomaBombero`, `SeguroBombero`, `FojaServicio`,
`HistorialInstitucional`, `HistorialCodigo`, `VehiculoAutorizado`, y las cuatro
condiciones institucionales: `CondicionCombatiente`, `CondicionIncorporado`,
`CondicionHonorario`, `CondicionApoyoEconomico`.

`CondicionInstitucional` = `INCORPORADO` | `COMBATIENTE` | `APOYO_ECONOMICO` |
`HONORARIO`. Reglas: [[rule--cedula-y-numero-bombero-unicos]].

`personal.vehiculos_autorizados` es lo que habilita a alguien como CHOFER de guardia —
un cruce entre dominios que conviene tener presente.

Tablas sin backend todavía: `licencias`, `historial_medico`, `historial_disciplinario`.

### Seguridad — 13 permisos (+5 de `configuracion:`)

Usuarios, roles, permisos, sesiones, auditoría, apariencia del login, configuración del
sistema y perfil propio.

Entidades: `Usuario`, `Rol`, `Permiso`, `AsignacionRol`, `AsignacionPermisoRol`,
`AsignacionPermisoDirecto`, `Sesion`, `LogAuditoria`, `HistorialContrasena`,
`UsuarioCorreo`, `UsuarioTelefono`, `ConfiguracionSistema`, `ConfiguracionValor`,
`ConfiguracionVersion`.

El corazón es `PolicyEngineService` — ver [[rule--permisos-efectivos]] y
[[decision--permisos-dinamicos]].

### Guardias — 5 permisos · desarrollo activo

Operación del turno de guardia. Módulo nuevo, sacado de dentro de Asistencia.

Entidades: `Guardia`, `GrupoGuardia`, `GrupoGuardiaMiembro`, `Pernocte`,
`NovedadGuardia`, `InspeccionEstacion`, `RequisitoRolGuardia`.

Permisos: `guardias:ver`, `crear`, `editar`, `asignar`, `requisitos`. Notar que
**`asignar` es propio**: armar la dotación no es lo mismo que corregir datos del turno.

`RolGrupoGuardia` = `TITULAR` | `CHOFER`. `EstadoInspeccionEstacion` = `OK` | `NO_OK`.

Flujo completo: [[workflow--guardia-y-pernocte]]. Regla clave:
[[rule--elegibilidad-de-rol-guardia]].

### Asistencia — 10 permisos

Presencia del personal: eventos, marcaciones e importación del marcador biométrico.

Entidades: `EventoAsistencia`, `ParticipanteEvento`, `ParticipanteExterno`,
`MarcacionAsistencia`, `ToleranciaAsistencia`, `AsignacionGuardia`, `CambioGuardia`,
`ImportacionMarcador`, `ImportacionMarcadorFila`.

Flujos: [[workflow--asistencia-a-evento]], [[workflow--importacion-marcador]].
Regla clave: [[rule--tolerancia-null-es-la-general]].

### Servicios — 5 permisos

Emergencias atendidas y su documentación formal.

Entidades: `Servicio`, `TipoServicio`, `PersonalServicio`, `ComunicacionServicio`.
`EstadoServicio` = `REGISTRADO` | `DESPACHADO` | `EN_CURSO` | `FINALIZADO` | `CANCELADO`.
`GravedadServicio` = `LEVE` | `MODERADA` | `GRAVE` | `CRITICA`.

La comunicación de servicio es el formulario digital que reemplaza el papel:
[[workflow--comunicacion-de-servicio]], [[decision--comunicacion-como-json]],
[[rule--una-comunicacion-por-servicio]].

### Equipos — 6 permisos · sin pantalla propia

`Equipo`, `CategoriaEquipo`, `PrestamoEquipo`. Migración 024 propia.
`EstadoEquipo` = `OPERATIVO` | `EN_MANTENIMIENTO` | `DANIADO` | `BAJA` | `PRESTADO`.
`EstadoPrestamoEquipo` = `PRESTADO` | `DEVUELTO` | `EXTRAVIADO` | `DANIADO`.

### Vehículos — 6 permisos · sin pantalla propia

`Vehiculo` (esquema `vehiculos`) y `VehiculoAutorizado` (esquema `personal`).
Migración 023 (móviles). `EstadoVehiculo` = `OPERATIVO` | `EN_MANTENIMIENTO` |
`FUERA_SERVICIO` | `BAJA`.

### Publicaciones — 1 permiso

Contenido institucional público. Único módulo con endpoints **sin autenticación**
(`GET /publicaciones/publicas`, `/estadisticas`). Persiste en el esquema `contenido`
(migración 026). Administrar exige `publicaciones:administrar` **o**
`seguridad:configurar_apariencia`.

## Módulos declarados y no construidos

| Módulo | Tablas listas | Situación |
|---|---|---|
| **Academia** | 7 tablas | Sin backend. `Curso`, `Materia`, `InscripcionCurso` existen como entidades; `aspirantes`, `examenes`, `notas_examenes`, `asistencia_academia` no |
| **Finanzas** | 2 tablas | Sin backend ni entidades |
| **Depósito** | 2 tablas | Sin backend ni entidades. Hay un rol "Encargado de Depósito" sembrado |
| **Documentos** | 1 tabla | Sin backend ni entidades |
| **Inteligencia** | — | Sin tablas. Alertas y dashboard de comandancia |

Para habilitar uno: `disponible: true`, **sembrar permisos con su prefijo exacto**, y
crear la carpeta de rutas. Sin el paso del medio no aparece para nadie. Guardias es el
ejemplo completo de ese camino recorrido.

## Consultar un dominio

```bash
node .context/graph/context.mjs --dominio personal --level L1
node .context/graph/context.mjs --dominio guardias --tipo RULE
node .context/graph/context.mjs pernocte grupo --level L2   # mejor que filtrar por dominio
```

Para Guardias conviene **buscar por término** en vez de filtrar por dominio: sus
entidades quedan clasificadas bajo `asistencia` porque su esquema es `operaciones`.
