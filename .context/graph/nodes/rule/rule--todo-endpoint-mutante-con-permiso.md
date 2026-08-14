---
id: rule--todo-endpoint-mutante-con-permiso
tipo: RULE
nombre: Todo endpoint que lee o modifica datos declara el permiso que exige
nivel: L1
dominio: seguridad
resumen: "Cada ruta va con @RequirePermission y los guards JwtAuthGuard + PermissionsGuard. El codigo del permiso sigue el formato modulo:accion."
severidad: CRITICA
archivos:
  - backend/src/modules/seguridad/guards/permissions.guard.ts
  - backend/src/modules/seguridad/decorators/require-permission.decorator.ts
edges:
  - [affects, component--modulo-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [permiso, endpoint, guard, requirepermission, jwt, autorizacion, ruta, todo, lee, modifica, datos, declara, exige, cada, require, permission, guards, auth, permissions, codigo, sigue, formato, modulo, accion]
---

# Todo endpoint que lee o modifica datos declara el permiso que exige

Cada ruta va con @RequirePermission y los guards JwtAuthGuard + PermissionsGuard. El codigo del permiso sigue el formato modulo:accion.

## El invariante

Un controlador nuevo se escribe asi:

```ts
<<<<<<< Updated upstream
@Controller('guardias/grupos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GruposGuardiaController {
  @Get()    @RequirePermission('guardias:ver')    listar() {}
  @Post()   @RequirePermission('guardias:crear')  crear() {}
  @Patch(':id') @RequirePermission('guardias:editar') editar() {}
=======
@Controller('organizacion/rangos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RangosController {
  @Get()    @RequirePermission('organizacion:rangos_ver')    listar() {}
  @Post()   @RequirePermission('organizacion:rangos_crear')  crear() {}
  @Patch(':id') @RequirePermission('organizacion:rangos_editar') editar() {}
  @Delete(':id') @RequirePermission('organizacion:rangos_eliminar') borrar() {}
>>>>>>> Stashed changes
}
```

## Formato del codigo de permiso

`modulo:accion` o `modulo:recurso_accion`. Los prefijos en uso son `asistencia:`,
<<<<<<< Updated upstream
`configuracion:`, `equipos:`, `guardias:`, `organizacion:`, `personal:`,
`publicaciones:`, `seguridad:`, `servicios:`, `vehiculos:`.
=======
`equipos:`, `organizacion:`, `personal:`, `publicaciones:`, `seguridad:`,
`servicios:`, `vehiculos:`, `configuracion:`.
>>>>>>> Stashed changes

`@RequirePermission` acepta **varios** codigos, y alcanza con tener uno (OR):

```ts
@RequirePermission('publicaciones:administrar', 'seguridad:configurar_apariencia')
```

## Un permiso nuevo son dos pasos, no uno

1. Usarlo en `@RequirePermission`.
2. **Sembrarlo** en `seguridad.permisos` y asignarlo a algun rol.

Si falta el paso 2 el endpoint compila, arranca y **nadie puede usarlo nunca**: el
guard no encuentra el permiso en el conjunto efectivo de ningun usuario. El fallo se
ve como un 403 inexplicable.

<<<<<<< Updated upstream
Para cruzar ambos lados: `graph/indexes/permissions.json` lista los 118 codigos que
el codigo exige, con que nodo los pide.

## Granularidad real, que es despareja

`organizacion:` tiene 53 permisos (cuatro por catalogo); `guardias:` tiene 5 (`ver`,
`crear`, `editar`, `asignar`, `requisitos`) para seis controladores. No hay una regla
uniforme: al agregar un endpoint, mirar que permisos ya usa su modulo antes de
inventar uno nuevo.
=======
Para cruzar ambos lados: `graph/indexes/permissions.json` lista todos los codigos
que el codigo exige.
>>>>>>> Stashed changes

## Excepciones deliberadas

`auth/login`, `auth/refresh` y las rutas publicas de `publicaciones`
(`GET /publicaciones/publicas`, `GET /publicaciones/estadisticas`) no llevan guard,
por diseno: alimentan la pantalla publica antes del login.


## Archivos

- `backend/src/modules/seguridad/guards/permissions.guard.ts`
- `backend/src/modules/seguridad/decorators/require-permission.decorator.ts`

## Relaciones

- `affects` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[decision--permisos-dinamicos|Permisos dinamicos en base de datos, no roles hardcodeados]] `constrains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
