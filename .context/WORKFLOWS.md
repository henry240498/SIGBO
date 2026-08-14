---
tipo: WORKFLOWS
nivel: L1
---

# Flujos y máquinas de estado

Todo estado del dominio existe **dos veces**: como `export type` en la entidad y como
`CHECK` en la tabla. Ampliar uno sin el otro compila y falla al guardar — ver
[[rule--reglas-duplicadas-bd-y-codigo]].

<<<<<<< Updated upstream
## Los seis flujos documentados
=======
## Los cinco flujos documentados
>>>>>>> Stashed changes

| Flujo | Dominio | Detalle |
|---|---|---|
| Login, sesión y refresco de token | seguridad | [[workflow--login-y-sesion]] |
<<<<<<< Updated upstream
| Operación de una guardia: grupos, presencia, pernoctes | guardias | [[workflow--guardia-y-pernocte]] |
=======
>>>>>>> Stashed changes
| Ciclo de vida de la comunicación de servicio | servicios | [[workflow--comunicacion-de-servicio]] |
| Importación de marcaciones del marcador | asistencia | [[workflow--importacion-marcador]] |
| Evento de asistencia y participantes | asistencia | [[workflow--asistencia-a-evento]] |
| Configuración en tres niveles con versiones | seguridad | [[workflow--configuracion-versionada]] |

<<<<<<< Updated upstream
## Guardia — el flujo activo

```
GrupoGuardia (ACTIVO/INACTIVO)
  └── GrupoGuardiaMiembro  rol: TITULAR | CHOFER
          │  al asignar se valida elegibilidad (puede rechazar con 400)
          ▼
Guardia  PROGRAMADA → EN_CURSO → FINALIZADA | CANCELADA | REEMPLAZADA
  ├── AsignacionGuardia   ASIGNADO → CONFIRMADO | REEMPLAZADO | AUSENTE
  │     ├── horario
  │     └── presencia
  ├── NovedadGuardia
  ├── InspeccionEstacion  OK | NO_OK
  └── Pernocte            entrada → salida
```

`guardias:asignar` es el único permiso propio de una acción operativa. **Un pernocte no
tiene estado enumerado**: está abierto si no tiene salida registrada.

## Comunicación de servicio
=======
## Comunicación de servicio — el flujo activo
>>>>>>> Stashed changes

```
                  enviar-revision
   BORRADOR ─────────────────────────► PENDIENTE_REVISION
      ▲                                    │        │
      │ reabrir                    observar│        │finalizar
      │                                    ▼        ▼
      └──────────────────────────────  OBSERVADO   FINALIZADA
                     reabrir
                                    (anular desde cualquiera) ──► ANULADO
```

Cuatro transiciones comparten `servicios:editar`. Solo **finalizar** y **anular** exigen
<<<<<<< Updated upstream
permisos propios: la separación entre redactar y cerrar formalmente.
=======
permisos propios (`servicios:finalizar`, `servicios:eliminar`): la separación deliberada
entre redactar y cerrar formalmente.
>>>>>>> Stashed changes

**Anular, no borrar.** La FK tiene `ON DELETE CASCADE`: borrar el servicio destruye la
comunicación en silencio, incluso finalizada.

## Importación del marcador — dos fases

```
archivo ──► ANALIZADO ──► CONFIRMADO
                 └──────► CANCELADO
```

<<<<<<< Updated upstream
Analizar **no escribe** asistencia: clasifica fila por fila y espera confirmación humana.
=======
Analizar **no escribe** asistencia: clasifica fila por fila y espera confirmación
humana.
>>>>>>> Stashed changes

| Estado de fila | Se importa |
|---|---|
| `RECONOCIDO` | sí |
| `NO_IDENTIFICADO` | no — código sin bombero |
| `DUPLICADO` | no — repetida en el archivo |
| `YA_IMPORTADO` | no — hace idempotente reimportar |
| `INCONSISTENTE` | no — datos que no cierran |

## Catálogo de estados del sistema

Todos verificados en `backend/src/shared/entities/`:

<<<<<<< Updated upstream
### Guardias
- `EstadoGuardia`: `PROGRAMADA` → `EN_CURSO` → `FINALIZADA` | `CANCELADA` | `REEMPLAZADA`
- `TurnoGuardia`: `DIURNO` | `NOCTURNO` | `COMPLETO`
- `TipoGuardiaRegistro`: `ORDINARIA` | `ESPECIAL` | `EXTRAORDINARIA`
- `EstadoGrupoGuardia`: `ACTIVO` | `INACTIVO`
- `RolGrupoGuardia`: `TITULAR` | `CHOFER`
- `EstadoInspeccionEstacion`: `OK` | `NO_OK`
- `EstadoAsignacionGuardia`: `ASIGNADO` → `CONFIRMADO` | `REEMPLAZADO` | `AUSENTE`
- `EstadoCambioGuardia`: `PENDIENTE` → `APROBADO` | `RECHAZADO` | `CANCELADO`

=======
>>>>>>> Stashed changes
### Servicios
- `EstadoServicio`: `REGISTRADO` → `DESPACHADO` → `EN_CURSO` → `FINALIZADO` | `CANCELADO`
- `GravedadServicio`: `LEVE` | `MODERADA` | `GRAVE` | `CRITICA`
- `EstadoComunicacionServicio`: `BORRADOR` | `PENDIENTE_REVISION` | `OBSERVADO` | `FINALIZADA` | `ANULADO`
- `TipoComunicacionServicio`: `OTRAS_OCURRENCIAS` | `INCENDIO`

<<<<<<< Updated upstream
### Asistencia
- `EstadoEventoAsistencia`: `PROGRAMADO` → `EN_CURSO` → `FINALIZADO` | `CANCELADO`
=======
### Asistencia y guardias
- `EstadoEventoAsistencia`: `PROGRAMADO` → `EN_CURSO` → `FINALIZADO` | `CANCELADO`
- `EstadoGuardia`: `PROGRAMADA` → `EN_CURSO` → `FINALIZADA` | `CANCELADA` | `REEMPLAZADA`
- `EstadoAsignacionGuardia`: `ASIGNADO` → `CONFIRMADO` | `REEMPLAZADO` | `AUSENTE`
- `EstadoCambioGuardia`: `PENDIENTE` → `APROBADO` | `RECHAZADO` | `CANCELADO`
- `TurnoGuardia`: `DIURNO` | `NOCTURNO` | `COMPLETO`
- `TipoGuardiaRegistro`: `ORDINARIA` | `ESPECIAL` | `EXTRAORDINARIA`
>>>>>>> Stashed changes
- `EstadoParticipacion`: `COMPLETA` | `PARCIAL` | `NO_REGISTRADA` | `AUSENTE_CONFIRMADO`
- `TipoMarcacion`: `ENTRADA` | `SALIDA`
- `MetodoMarcacion`: `HUELLA` | `QR` | `PIN` | `RFID` | `MANUAL` | `APP`
- `FuenteAsistencia`: `MARCADOR_DIGITAL` | `MANUAL` | `IMPORTACION_EXCEL` | `EVENTO` | `GUARDIA` | `OTRO`
- `EstadoImportacionMarcador`: `ANALIZADO` → `CONFIRMADO` | `CANCELADO`
- `EstadoFilaImportacion`: `RECONOCIDO` | `NO_IDENTIFICADO` | `DUPLICADO` | `YA_IMPORTADO` | `INCONSISTENTE`

### Personal
- `CondicionInstitucional`: `INCORPORADO` | `COMBATIENTE` | `APOYO_ECONOMICO` | `HONORARIO`

### Equipos y vehículos
- `EstadoEquipo`: `OPERATIVO` | `EN_MANTENIMIENTO` | `DANIADO` | `BAJA` | `PRESTADO`
- `EstadoPrestamoEquipo`: `PRESTADO` | `DEVUELTO` | `EXTRAVIADO` | `DANIADO`
- `EstadoVehiculo`: `OPERATIVO` | `EN_MANTENIMIENTO` | `FUERA_SERVICIO` | `BAJA`

### Academia
- `EstadoCurso`: `PLANIFICADO` | `EN_CURSO` | `FINALIZADO` | `CANCELADO`
- `EstadoInscripcionCurso`: `INSCRITO` | `ACTIVO` | `RETIRADO` | `APROBADO` | `REPROBADO`
- `NivelMateria`: `BASICO` | `INTERMEDIO` | `AVANZADO`

### Genérico
- `estado`: `ACTIVO` | `INACTIVO` — en casi todos los catálogos. Verde/rojo en la
  interfaz, sin excepción: [[rule--sin-clases-css-nuevas]]

## Distinciones que importan

<<<<<<< Updated upstream
Tres pares que parecen sinónimos y no lo son:
=======
Dos pares que parecen sinónimos y no lo son:
>>>>>>> Stashed changes

- **`AUSENTE_CONFIRMADO` vs `NO_REGISTRADA`** — ausencia verificada vs falta de dato. El
  porcentaje de asistencia afecta decisiones sobre las personas: confundirlos es
  imputarle una ausencia a quien nadie registró.
- **Bloqueo automático vs administrativo** — cinco intentos fallidos
  ([[rule--bloqueo-tras-cinco-intentos]]) es defensa contra fuerza bruta; el bloqueo de
  `seguridad/usuarios` es una decisión humana. Mismo campo, significados distintos.
<<<<<<< Updated upstream
- **Permiso vs elegibilidad** — `guardias:asignar` dice quién puede *asignar*;
  `requisitos_rol_guardia` dice quién puede *ser asignado*. Dos mecanismos
  independientes: [[rule--elegibilidad-de-rol-guardia]].
=======
>>>>>>> Stashed changes

## Al agregar un estado nuevo

1. Ampliar el `export type` en la entidad.
<<<<<<< Updated upstream
2. **Migración** que actualice el `CHECK` de la tabla (si existe: verificá primero,
   varios enums no tienen constraint).
=======
2. **Migración** que actualice el `CHECK` de la tabla.
>>>>>>> Stashed changes
3. Revisar quién decide la transición: ¿alcanza el permiso existente o hace falta uno
   nuevo?
4. Revisar los badges de la interfaz: ¿es un estado "bueno" (verde) o "malo" (rojo)?

Saltearse el paso 2 es el error más común y el más confuso de diagnosticar.
