---
id: workflow--configuracion-versionada
tipo: WORKFLOW
nombre: Configuracion del sistema en tres niveles, con borrador y version publicada
nivel: L2
dominio: seguridad
resumen: Un registro tipado define cada clave. Los valores viven en configuracion_valores por nivel VISITANTE, USUARIO o GLOBAL, y las versiones publicadas en configuracion_versiones.
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
  - backend/src/modules/configuracion/configuracion.service.ts
edges:
  - [affects, entity--configuracion-valor]
  - [affects, entity--configuracion-version]
  - [affects, configuration--apariencia]
  - [belongs_to, domain--seguridad]
terminos: [configuracion, registro, nivel, visitante, usuario, global, version, borrador, publicar, token, sistema, tres, niveles, publicada, tipado, define, cada, clave, valores, viven, versiones, publicadas]
---

# Configuracion del sistema en tres niveles, con borrador y version publicada

Un registro tipado define cada clave. Los valores viven en configuracion_valores por nivel VISITANTE, USUARIO o GLOBAL, y las versiones publicadas en configuracion_versiones.

## El registro es el contrato

`CONFIG_REGISTRY` en `configuracion.registry.ts` declara cada una de las 26 claves con
su tipo, control de interfaz, default, permiso requerido y metadatos:

```ts
{ key, nombre, descripcion, categoria, nivel, tipo, control, defaultValue,
  allowed?, min?, max?, unidad?, public, userOverride, permission?,
  realtime, reload, sensitive, version }
```

**Una clave que no esta en el registro no existe.** No se guardan valores arbitrarios:
el registro define el universo de configuraciones posibles.

## Tres niveles

| Nivel | Quien lo decide | Ejemplos |
|---|---|---|
| `VISITANTE` | Cualquiera, sin login | `appearance.theme`, `accessibility.highContrast` |
| `USUARIO` | Cada usuario para si | `region.timezone`, `behavior.pageSize` |
| `GLOBAL` | Administracion, con permiso | `identity.appName`, `tokens.*`, `maintenance.enabled` |

`userOverride` indica si un usuario puede pisar el valor global. Las claves `GLOBAL`
exigen `configuracion:editar_borrador`.

## Borrador y publicacion

`seguridad.configuracion_valores` guarda los valores; `configuracion_versiones`, las
versiones publicadas. El modelo permite preparar cambios y publicarlos como un
conjunto, en vez de que cada guardado altere el sistema en vivo.

## Dos banderas que cambian como se aplica un cambio

- `realtime: true` → surte efecto sin recargar.
- `reload: true` → exige recargar la pagina (`region.language`,
  `navigation.defaultPage`, `operations.sessionMinutes`).

`ConfigBootstrap.tsx` en el frontend carga las claves `public` al iniciar.

## Advertencia

Los `tokens.*` describen un tema **claro** que hoy ninguna pantalla consume. Ver
[[rule--tema-claro-unico]] antes de tocar apariencia: la configuracion y las pantallas
no estan integradas.


## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`
- `backend/src/modules/configuracion/configuracion.service.ts`

## Relaciones

- `affects` → [[entity--configuracion-valor|ConfiguracionValor]]
- `affects` → [[entity--configuracion-version|ConfiguracionVersion]]
- `affects` → [[configuration--apariencia|Configuracion: Apariencia]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo **curado** (editable a mano).</sub>
