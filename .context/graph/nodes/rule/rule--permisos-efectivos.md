---
id: rule--permisos-efectivos
tipo: RULE
nombre: El permiso efectivo es roles vigentes mas directos concedidos menos directos denegados
nivel: L1
dominio: seguridad
resumen: "Union de permisos de roles no expirados, mas permisos directos con concedido=true, menos los que tienen concedido=false. La denegacion directa gana siempre."
severidad: CRITICA
archivos:
  - backend/src/modules/seguridad/policy-engine.service.ts
edges:
  - [affects, service--seguridad-policy-engine]
  - [affects, entity--asignacion-permiso-directo]
  - [affects, entity--asignacion-rol]
  - [belongs_to, domain--seguridad]
terminos: [permiso, efectivo, denegar, conceder, rol, expiracion, union, precedencia, roles, vigentes, directos, concedidos, menos, denegados, permisos, expirados, concedido, true, tienen, false, denegacion, directa, gana, siempre]
---

# El permiso efectivo es roles vigentes mas directos concedidos menos directos denegados

Union de permisos de roles no expirados, mas permisos directos con concedido=true, menos los que tienen concedido=false. La denegacion directa gana siempre.

## El invariante

```
efectivos = union(permisos de roles vigentes)
          + directos con concedido = true
          - directos con concedido = false
```

Verificado en `PolicyEngineService.getPermisosEfectivos()`.

## Las tres partes, en orden

1. **Roles vigentes.** Un rol cuenta solo si `fechaExpiracion` es `null` o mayor a
   `ahora`. Un rol expirado no aporta ningun permiso, aunque la fila de asignacion
   siga existiendo.
2. **Directos concedidos** se suman al conjunto.
3. **Directos denegados** se **quitan** del conjunto, incluso si un rol los otorgaba.

## Por que el orden importa

El codigo procesa los directos **despues** de los roles, y hace `permisoMap.delete()`
en el caso denegado. Es decir: **la denegacion explicita a un usuario gana sobre
cualquier rol**, sin importar cuantos roles se lo otorguen.

Ese es el mecanismo para excluir a una persona de algo puntual sin desarmarle el rol.

## Al modificar esto, cuidado

Si alguna vez se agrega cache de permisos, hay que invalidarla en los cinco puntos
donde el conjunto puede cambiar: asignar/quitar rol, asignar/quitar permiso directo,
y cambiar los permisos de un rol (que afecta a **todos** sus usuarios).

## Lo que esta regla NO dice

No hay alcance territorial: un permiso vale para toda la institucion, no por compania
ni cuartel. Y **no** cubre elegibilidad operativa: tener `guardias:asignar` te deja
asignar personal, pero quien puede *ser* CHOFER lo decide otra cosa — ver
[[rule--elegibilidad-de-rol-guardia]].


## Archivos

- `backend/src/modules/seguridad/policy-engine.service.ts`

## Relaciones

- `affects` → [[service--seguridad-policy-engine|PolicyEngineService]]
- `affects` → [[entity--asignacion-permiso-directo|AsignacionPermisoDirecto]]
- `affects` → [[entity--asignacion-rol|AsignacionRol]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[decision--permisos-dinamicos|Permisos dinamicos en base de datos, no roles hardcodeados]] `constrains` →
- [[workflow--login-y-sesion|Login, sesion y refresco de token]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
