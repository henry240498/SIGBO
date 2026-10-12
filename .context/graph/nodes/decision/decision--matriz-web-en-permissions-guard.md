---
id: decision--matriz-web-en-permissions-guard
tipo: DECISION
nombre: La matriz por pantalla rige toda la web y se exige en PermissionsGuard
nivel: L1
dominio: seguridad
estado: IMPLEMENTADA
resumen: "Las reglas por usuario/rol/rango/cargo de seguridad.pantalla_permisos se aplican a todas las pantallas web. El catálogo (código estable + rutas de API por pantalla) lo genera el frontend; el backend lo cruza con sus rutas reales al arrancar, sincroniza seguridad.pantallas y decide en PermissionsGuard después del rol. Sin reglas no cambia nada."
archivos:
  - backend/src/modules/pantallas/matriz-web.logica.ts
  - backend/src/modules/pantallas/matriz-web.service.ts
  - backend/src/modules/seguridad/guards/permissions.guard.ts
  - frontend/scripts/generar-pantallas.mjs
  - frontend/src/lib/permisos-pantalla.ts
edges:
  - [constrains, rule--confidencial-lo-decide-la-matriz]
  - [belongs_to, domain--seguridad]
terminos: [matriz, pantalla, permiso, regla, rol, rango, cargo, usuario, denegar, guard, catalogo, rige, toda, web, exige, permissions, reglas, seguridad, permisos, aplican, todas, pantallas, codigo, estable, rutas, api, genera, cruza, sus, reales, arrancar, sincroniza, decide, despues, cambia, nada]
---

# La matriz por pantalla rige toda la web y se exige en PermissionsGuard

Las reglas por usuario/rol/rango/cargo de seguridad.pantalla_permisos se aplican a todas las pantallas web. El catálogo (código estable + rutas de API por pantalla) lo genera el frontend; el backend lo cruza con sus rutas reales al arrancar, sincroniza seguridad.pantallas y decide en PermissionsGuard después del rol. Sin reglas no cambia nada.

## Decisión

- **Dónde se exige:** dentro de `PermissionsGuard`, que ya está en todos los controladores y corre
  después de `JwtAuthGuard`. Un guard global correría antes de conocer al usuario.
- **Catálogo sincronizado al arrancar**, no por migración: el catálogo es código; las reglas son
  filas que decide la institución. Una pantalla nueva solo necesita `npm run generar:pantallas`.
- **Restringe, no concede.** Denegar gana. Ruta compartida: alcanza con que una de sus pantallas lo
  permita. Rutas exentas (anti-bloqueo): `/pantallas/*`, `/auth/*`, `/salud`, `/centro-mando*`,
  perfil propio.
- **El cliente nativo (app móvil) queda exento**: tiene su matriz `0xA…`.

## Costo

Sobre-asociación: una pantalla queda ligada a todo lo que llaman los archivos que importa (incluidas
funciones de `lib/` que no usa). Denegar una pantalla puede no bloquear una ruta que otra pantalla
también "usa". Se acepta: nunca da más de lo que el rol permite. Un cliente que se haga pasar por la
app móvil evitaría las reglas web (no los permisos por rol); riesgo aceptado, a confirmar por el cuartel.


## Archivos

- `backend/src/modules/pantallas/matriz-web.logica.ts`
- `backend/src/modules/pantallas/matriz-web.service.ts`
- `backend/src/modules/seguridad/guards/permissions.guard.ts`
- `frontend/scripts/generar-pantallas.mjs`
- `frontend/src/lib/permisos-pantalla.ts`

## Relaciones

- `constrains` → [[rule--confidencial-lo-decide-la-matriz|Qué información confidencial ve una persona lo decide la matriz de pantallas, en el backend]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo **curado** (editable a mano).</sub>
