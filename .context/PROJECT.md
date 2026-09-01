---
tipo: PROJECT
nivel: L0
---

# SIGBO-CBVC — Sistema Integral de Gestión para Bomberos Voluntarios

Sistema de gestión institucional para el Cuerpo de Bomberos Voluntarios. Administra
personal, organigrama, asistencia, guardias, servicios operativos, vehículos, equipos y
seguridad de acceso.

Aplicación **interna**, detrás de login, con una única excepción pública: la pantalla de
publicaciones y sus estadísticas.

## Estado real, verificado sobre el código

| Módulo | Backend | Pantallas | Estado |
|---|---|---|---|
| **Organización** | 14 controladores | 14 pantallas | Completo: compañías, cuarteles, brigadas, unidades, departamentos, cargos, rangos, especialidades, turnos, tipos de guardia, designaciones, ascensos, parámetros |
| **Seguridad** | 12 controladores | 8 pantallas | Completo: usuarios, roles, permisos, sesiones, auditoría, apariencia, configuración |
| **Personal** | 10 controladores | 3 pantallas | Funcional: CRUD de bomberos, condiciones, especialidades, idiomas, seguros, foja de servicio, historial |
| **Asistencia** (esquema `operaciones`) | 7 controladores | 9 pantallas | Funcional: eventos, guardias, marcaciones, importación de marcador, tolerancias, externos, dashboard |
| **Guardias** | 6 controladores | 7 pantallas | **Nuevo y activo**: grupos, asignaciones con elegibilidad, presencia, novedades, inspecciones, pernoctes, requisitos de rol |
| **Servicios** | 1 controlador | 2 pantallas | Activo: comunicaciones de servicio con PDF |
| **Equipos** | 3 controladores | — | API; migración 024 propia |
| **Vehículos** | 2 controladores | — | API; migración 023 (móviles) |
| **Publicaciones** | 1 controlador | 1 pantalla | Funcional, con rutas públicas; persiste en esquema `contenido` |
| **Academia, Finanzas, Depósito, Documentos, Inteligencia** | — | — | `disponible: false`. Tablas creadas (salvo Inteligencia), sin backend |

**Datos reales cargados:** 164 personas (103 combatientes, 4 incorporados, 39 activos,
9 honorarios, 9 brigadistas), con campos obligatorios pendientes de completar —
ver `docs/REGISTRO-CAMBIOS-2026-08-07.md`.

## Cómo correrlo

```powershell
cd backend;  npm run start:dev    # http://localhost:3001/api/v1
cd frontend; npm run dev          # http://localhost:3000
```

O `start-sigbo.ps1`, que hace las dos cosas y abre el navegador. Los logs quedan en
`logs/`.

El iniciador recompila y reinicia solo procesos de SIGBO previamente detectados en los
puertos 3000/3001. Si uno pertenece a otro proyecto, se detiene con un mensaje para
evitar terminarlo accidentalmente.

- Swagger: `http://localhost:3001/api/docs`
- Credenciales de desarrollo: `docs/CREDENCIALES-Y-ROLES.md` (7 roles, 7 usuarios)
- Migraciones: `database/run-migrations.ps1`

## Restricciones del entorno de desarrollo

- **SQL Server Express local**, instancia `SQLEXPRESS`, con TCP/IP deshabilitado de
  fábrica — ver [[error--tcp-sqlexpress-deshabilitado]].
- Se tiene rol `sysadmin` **en SQL** pero no administrador **de Windows**: habilitar TCP
  o modificar el servicio requiere lo segundo.
- Node 24, Windows 10, PowerShell 5.1 (no PS7: sin `&&`, sin ternario).
- Los archivos `sigbo_cbvc.mdf` / `.ldf` están en la raíz del repositorio y contienen
  datos reales de personas. `.gitignore` los excluye.

## Deuda técnica conocida, priorizada

1. **Sin pruebas automatizadas.** No hay suite en backend ni frontend. Toda verificación
   es manual o vía Swagger. Es la deuda más costosa: cada cambio se valida a mano.
2. **Documentación desactualizada.** `docs/README.md` dice "42 tablas, 10 esquemas"; la
   realidad son **88 tablas en 12 esquemas**. Es la prueba viva de por qué este grafo se
   regenera en vez de escribirse.
3. **Guardias vive en el esquema `operaciones`** aunque sea un módulo propio, y hay
   superposición con Asistencia (pantallas de guardias en los dos lados) —
   ver [[rule--guardias-vive-en-operaciones]].
4. **Los tokens de tema de Configuración no están cableados.** El tema claro ya está
   completo en las pantallas, pero sale de `:root` en `globals.css`, no de
   `configuracion_valores` — ver [[rule--tema-claro-unico]].
5. **Numeración de migraciones colisionada:** dos archivos con prefijo `017`.
6. **Secretos de desarrollo en el repositorio:** `JWT_SECRET` y contraseñas semilla hay
   que rotar antes de cualquier uso real.
7. **`/uploads` se sirve como estático sin pasar por el guard de permisos.**

## Antes de producción

- Rotar `JWT_SECRET` y `REFRESH_TOKEN_SECRET`.
- Forzar cambio de contraseña de todos los usuarios semilla (`debeCambiarPassword`).
- Activar `DB_ENCRYPT=true` con certificado válido.
- Sacar los archivos `.mdf`/`.ldf` de la carpeta del repositorio.

## Para orientarte

```bash
node .context/graph/context.mjs --mapa                    # el mapa de dominios
node .context/graph/context.mjs <lo que vas a tocar>      # contexto de la tarea
```

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para cómo está armado, y [DOMAIN.md](DOMAIN.md)
para qué hay en cada módulo.
