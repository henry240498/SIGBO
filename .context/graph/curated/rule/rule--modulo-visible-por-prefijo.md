---
id: rule--modulo-visible-por-prefijo
tipo: RULE
nombre: Un modulo aparece en el menu si el usuario tiene algun permiso con su prefijo
nivel: L2
resumen: moduloVisible() compara el permisoPrefijo del modulo contra los permisos del usuario. Un modulo sin ningun permiso que empiece con su prefijo es invisible.
severidad: MEDIA
archivos: [frontend/src/lib/modulos.ts]
terminos: [modulo, menu, visible, prefijo, permiso, disponible, navegacion, slug]
edges:
  - [affects, component--front-modulos]
---

## El invariante

```ts
export function moduloVisible(modulo: ModuloConfig, permisos: string[]): boolean {
  return permisos.some((p) => p.startsWith(modulo.permisoPrefijo));
}
```

`MODULOS` declara 14 modulos, cada uno con `slug`, `nombre`, `icono`,
`permisoPrefijo` y `disponible`.

## Dos filtros distintos, no confundirlos

- **`disponible: false`** — el modulo no esta construido. Hoy: `academia`,
  `finanzas`, `deposito`, `documentos`, `inteligencia`.
- **`moduloVisible()` falso** — el modulo existe pero este usuario no tiene ningun
  permiso de ese prefijo.

Un modulo se muestra solo si pasa **ambos**.

## Los 9 habilitados hoy

`organizacion`, `personal`, `asistencia`, `guardias`, `servicios`, `vehiculos`,
`equipos`, `publicaciones`, `seguridad`.

## Al habilitar un modulo nuevo

1. Poner `disponible: true` en `modulos.ts`.
2. **Sembrar permisos con ese prefijo exacto** — si no, ningun usuario lo vera y va a
   parecer que el cambio no surtio efecto.
3. Crear la carpeta de rutas en `frontend/src/app/dashboard/<slug>/`.

Guardias es el ejemplo completo de este camino: paso de `disponible: false` con
permisos `asistencia:guardias_*` a modulo propio con prefijo `guardias:` (5 permisos:
`ver`, `crear`, `editar`, `asignar`, `requisitos`), backend propio y 7 pantallas bajo
`/dashboard/guardias/`.

## Desalineaciones reales que quedan

- **`asistencia:` corresponde al modulo backend `operaciones`** y al esquema
  `operaciones`. No existe prefijo `operaciones:`.
- **Las tablas de guardias tambien viven en `operaciones`**, no en un esquema propio —
  ver [[rule--guardias-vive-en-operaciones]].
- Sobrevive una pantalla `/dashboard/organizacion/guardias` aparte de
  `/dashboard/guardias`: son cosas distintas (catalogo de tipos de guardia vs.
  operacion de guardias).
- `/dashboard/[modulo]/page.tsx` es la ruta comodin que atiende los slugs sin pantalla
  propia.
