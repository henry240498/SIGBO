---
id: decision--permisos-dinamicos
tipo: DECISION
nombre: Permisos dinamicos en base de datos, no roles hardcodeados
nivel: L1
dominio: seguridad
estado: VIGENTE
resumen: Los permisos son filas, no constantes. Un Policy Engine calcula el conjunto efectivo por usuario combinando roles vigentes y permisos directos.
archivos:
  - backend/src/modules/seguridad/policy-engine.service.ts
  - backend/src/modules/seguridad/guards/permissions.guard.ts
edges:
  - [constrains, rule--permisos-efectivos]
  - [constrains, rule--todo-endpoint-mutante-con-permiso]
  - [constrains, rule--frontend-no-autoriza]
  - [belongs_to, domain--seguridad]
terminos: [permisos, roles, policy, engine, autorizacion, rbac, directos, efectivos, guard, dinamicos, base, datos, hardcodeados, son, filas, constantes, calcula, conjunto, efectivo, usuario, combinando, vigentes]
---

# Permisos dinamicos en base de datos, no roles hardcodeados

Los permisos son filas, no constantes. Un Policy Engine calcula el conjunto efectivo por usuario combinando roles vigentes y permisos directos.

## Decision

Ningun rol esta codificado en el backend. Son tablas: `seguridad.permisos`,
`seguridad.roles`, `seguridad.asignacion_permisos_rol`,
`seguridad.asignacion_roles`, `seguridad.asignacion_permisos_directos`. Y
`PolicyEngineService.getPermisosEfectivos(usuarioId)` resuelve el conjunto en
tiempo de request.

Un endpoint declara **que permiso exige**, nunca que rol:

```ts
<<<<<<< Updated upstream
@RequirePermission('guardias:asignar')
=======
@RequirePermission('organizacion:rangos_crear')
>>>>>>> Stashed changes
```

## Motivo

La institucion cambia su organigrama sin tocar codigo. Un permiso nuevo es una
fila mas; un rol nuevo, una fila y sus asignaciones. Hay 7 roles predeterminados
sembrados, pero nada en el codigo depende de que existan.

## Costo aceptado

- Cada request autenticado recalcula permisos con varias consultas. **No hay
  cache** — es el costo consciente de que un cambio de permisos surta efecto de
  inmediato.
- Un permiso mal escrito en `@RequirePermission` no falla al compilar: queda un
  endpoint que **nadie** puede usar. De ahi que el grafo mantenga
<<<<<<< Updated upstream
  `graph/indexes/permissions.json`, que permite cruzar los 118 codigos que el
  codigo exige contra los que la base tiene sembrados.
=======
  `graph/indexes/permissions.json`, que permite cruzar los codigos que el codigo
  exige contra los que la base tiene sembrados.
>>>>>>> Stashed changes

## Alcance de los permisos

Son **globales por usuario**, no por compania ni cuartel. Un usuario con
`personal:editar` puede editar cualquier bombero de cualquier compania. Si se
necesitara alcance territorial, hay que disenarlo: hoy no existe.

<<<<<<< Updated upstream
Notar que la **elegibilidad** para un rol operativo es un mecanismo distinto y
paralelo a los permisos: ver [[rule--elegibilidad-de-rol-guardia]].

=======
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/seguridad/policy-engine.service.ts`
- `backend/src/modules/seguridad/guards/permissions.guard.ts`

## Relaciones

- `constrains` → [[rule--permisos-efectivos|El permiso efectivo es roles vigentes mas directos concedidos menos directos denegados]]
- `constrains` → [[rule--todo-endpoint-mutante-con-permiso|Todo endpoint que lee o modifica datos declara el permiso que exige]]
- `constrains` → [[rule--frontend-no-autoriza|El frontend oculta, el backend autoriza]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo **curado** (editable a mano).</sub>
