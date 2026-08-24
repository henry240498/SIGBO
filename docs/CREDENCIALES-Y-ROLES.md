# SIGBO-CBVC — Credenciales y Roles (Entorno de Desarrollo/Pruebas)

> **IMPORTANTE:** Estas credenciales corresponden exclusivamente al entorno de
> desarrollo/pruebas local (SQL Server Express en esta maquina). Antes de
> cualquier uso en produccion se debe forzar el cambio de contrasena de todos
> los usuarios y regenerar los secretos JWT (`backend/.env`).
>
> `npm run seed` está bloqueado en producción salvo una habilitación temporal
> explícita y, aun así, no crea estas cuentas de demostración. Las cuentas reales
> deben crearse mediante el flujo administrativo autorizado.

Antes de ejecutar el seed local, definir `SIGBO_DEMO_PASSWORD` en
`backend/.env` con una clave que cumpla la política de contraseñas. Esa clave
no se versiona ni se publica en este documento.

## Usuario Administrador (acceso completo)

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | admin@sigbo-cbvc.local |
| Rol | Administrador General |
| Permisos | Todos los permisos vigentes del catálogo (acceso total) |

## Usuarios de prueba por rol

Se creo un usuario de prueba para cada rol predeterminado del sistema. El rol
**Encargado de Deposito** fue agregado durante la implementacion: el
documento de especificacion lo menciona como perfil de usuario objetivo
(seccion 1.3) pero no lo incluia en la lista formal de roles predeterminados
(seccion 4.2); se formalizo aqui para que todo el publico objetivo descrito
tenga un rol y usuario correspondiente.

---

### 1. Comandante

| Campo | Valor |
|---|---|
| Usuario | `comandante` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | comandante@sigbo-cbvc.local |
| Rol | Comandante |
| Descripcion | Acceso a todas las operaciones y gestion de personal |

**Funcionalidades habilitadas (21 permisos):**
- Personal: ver, editar estado, editar rango
- Servicios: ver, despachar, finalizar
- Guardias: ver, asignar, cambiar
- Asistencia: ver, ver porcentaje, generar alertas
- Vehiculos: ver — Equipos: ver
- Documentos: ver, crear, firmar
- Inteligencia: ver alertas, ver dashboard
- Finanzas: ver — Academia: ver

---

### 2. Jefe de Guardia

| Campo | Valor |
|---|---|
| Usuario | `jefe_guardia` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | jefe_guardia@sigbo-cbvc.local |
| Rol | Jefe de Guardia |
| Descripcion | Gestion de la guardia actual y servicios en curso |

**Funcionalidades habilitadas (11 permisos):**
- Personal: ver
- Servicios: ver, crear, editar, despachar, finalizar
- Guardias: ver, calendario
- Asistencia: marcar
- Vehiculos: ver — Equipos: ver

---

### 3. Instructor

| Campo | Valor |
|---|---|
| Usuario | `instructor` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | instructor@sigbo-cbvc.local |
| Rol | Instructor |
| Descripcion | Gestion de cursos y academia |

**Funcionalidades habilitadas (10 permisos):**
- Personal: ver
- Academia: ver, crear curso, editar curso, inscribir, calificar, certificar
- Asistencia: ver, marcar
- Documentos: ver

---

### 4. Bombero Operativo

| Campo | Valor |
|---|---|
| Usuario | `bombero` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | bombero@sigbo-cbvc.local |
| Rol | Bombero Operativo |
| Descripcion | Funcionalidades basicas para bomberos activos |

**Funcionalidades habilitadas (7 permisos):**
- Personal: ver (su propio perfil)
- Asistencia: ver, marcar, ver porcentaje
- Guardias: ver — Servicios: ver — Documentos: ver

---

### 5. Tesorero

| Campo | Valor |
|---|---|
| Usuario | `tesorero` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | tesorero@sigbo-cbvc.local |
| Rol | Tesorero |
| Descripcion | Gestion financiera completa |

**Funcionalidades habilitadas (9 permisos):**
- Finanzas: ver, crear, editar, eliminar, balance
- Deposito: ver, movimiento
- Documentos: ver, crear

---

### 6. Encargado de Deposito

| Campo | Valor |
|---|---|
| Usuario | `deposito` |
| Contrasena | Valor local de `SIGBO_DEMO_PASSWORD` |
| Email | deposito@sigbo-cbvc.local |
| Rol | Encargado de Deposito |
| Descripcion | Control de inventario, stock de consumibles y prestamos de equipos |

**Funcionalidades habilitadas (8 permisos):**
- Deposito: ver, crear, editar, movimiento
- Equipos: ver, prestar, mantenimiento
- Documentos: ver

---

## Como se otorgan los permisos

Los permisos no se verifican por rol directamente: cada usuario tiene un
conjunto de **permisos efectivos** calculado por el Policy Engine
(`backend/src/modules/seguridad/policy-engine.service.ts`) como la union de
los permisos de todos sus roles, mas permisos directos concedidos, menos
permisos directos denegados explicitamente. Esto permite, por ejemplo, dar a
un bombero puntual un permiso adicional sin crear un rol nuevo.

El catálogo completo de permisos y la asignación por rol está en
`backend/src/database/seed-data.ts` y se carga con `npm run seed`.

## Endpoints de autenticacion

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/v1/auth/login` | `{ usernameOrEmail, password }` → cookies HttpOnly de sesión + perfil mínimo |
| POST | `/api/v1/auth/refresh` | Renueva la sesión mediante la cookie de refresh; no recibe ni devuelve tokens en JSON |
| POST | `/api/v1/auth/logout` | Invalida la sesión asociada a la cookie y la elimina |
| GET | `/api/v1/seguridad/mis-permisos` | Permisos efectivos del usuario autenticado |
| GET | `/api/v1/seguridad/mis-roles` | Roles del usuario autenticado |

La documentación interactiva Swagger está deshabilitada por omisión. Habilitarla
de forma explícita mediante `SWAGGER_ENABLED=true` sólo en un entorno controlado
y con acceso de red restringido.
