---
id: decision--matriz-web-en-permissions-guard
tipo: DECISION
nombre: La matriz por pantalla rige toda la web y se exige en PermissionsGuard
nivel: L1
resumen: Las reglas por usuario/rol/rango/cargo de seguridad.pantalla_permisos se aplican a todas las pantallas web. El catálogo (código estable + rutas de API por pantalla) lo genera el frontend; el backend lo cruza con sus rutas reales al arrancar, sincroniza seguridad.pantallas y decide en PermissionsGuard después del rol. Sin reglas no cambia nada.
estado: IMPLEMENTADA
dominio: seguridad
fuente: docs/superpowers/specs/2026-10-09-centro-de-mando-design.md
archivos:
  - backend/src/modules/pantallas/matriz-web.logica.ts
  - backend/src/modules/pantallas/matriz-web.service.ts
  - backend/src/modules/seguridad/guards/permissions.guard.ts
  - frontend/scripts/generar-pantallas.mjs
  - frontend/src/lib/permisos-pantalla.ts
edges:
  - [constrains, rule--confidencial-lo-decide-la-matriz]
terminos: [matriz, pantalla, permiso, regla, rol, rango, cargo, usuario, denegar, guard, catalogo]
---

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
