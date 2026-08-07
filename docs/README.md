# SIGBO-CBVC — Documentacion del Proyecto (Fase 0 + Fase 1)

Implementacion inicial del Sistema Integral de Gestion para Bomberos
Voluntarios, basada en la especificacion de `Proyecto.txt`, adaptada a las
herramientas disponibles en este equipo.

## Decisiones de arquitectura (vs. el documento original)

El documento original especifica una arquitectura de microservicios con
Kafka, Elasticsearch, MinIO, Kubernetes, PostgreSQL y Flutter. Para poder
entregar un sistema que efectivamente corra en esta maquina, se adapto a:

| Aspecto | Documento original | Implementado |
|---|---|---|
| Backend | Microservicios NestJS | **Monolito modular NestJS** (mismos modulos, misma API REST) |
| Base de datos | PostgreSQL 15 + TimescaleDB | **SQL Server 2019 Express** (a pedido del usuario) |
| Cache/Busqueda/Archivos | Redis, Elasticsearch, MinIO | No implementado en esta fase |
| Frontend | Next.js 14 + Tailwind + Shadcn/ui | **Next.js 14** (App Router), estilos propios sin libreria UI |
| Mensajeria | Kafka (event sourcing/CQRS) | No implementado en esta fase |
| App movil | Flutter | No implementado en esta fase |

El modelo de datos (42 tablas, 10 esquemas), el sistema de roles/permisos
dinamicos y las reglas de negocio de asistencia siguen el documento original
punto por punto; solo cambia el dialecto SQL (T-SQL en vez de PL/pgSQL) y el
formato de columnas (`UNIQUEIDENTIFIER`/`DATETIMEOFFSET`/`NVARCHAR(MAX)` en
vez de `UUID`/`TIMESTAMPTZ`/`JSONB`).

## Que esta funcionando

- **Base de datos completa**: 10 esquemas, 42 tablas, 77 llaves foraneas,
  133 indices (`database/migrations/`).
- **Autenticacion**: login con JWT + refresh token, bloqueo tras 5 intentos
  fallidos (15 minutos), sesiones persistidas en `seguridad.sesiones`.
- **Motor de permisos (Policy Engine)**: permisos dinamicos por rol +
  permisos directos por usuario (conceder/denegar), igual al diseño de la
  seccion 4.1 del documento.
- **Modulo de Personal**: CRUD de bomberos con las reglas del documento
  (cedula y numero de bombero unicos, baja con motivo, etc).
- **Frontend**: pantalla de login funcional contra la API real y dashboard
  que muestra roles, permisos efectivos y el listado de bomberos.
- **7 roles y 7 usuarios de prueba** con permisos reales — ver
  [`CREDENCIALES-Y-ROLES.md`](./CREDENCIALES-Y-ROLES.md).

## Que falta (fases siguientes del plan original, seccion 9)

Academia, Guardias/Servicios operativos, Vehiculos/Equipos, Finanzas,
Deposito, Documentos, Modulo de Inteligencia/Alertas, Dashboard de
Comandancia con widgets, Modo Emergencia, app movil y notificaciones en
tiempo real. Las tablas de base de datos para todos estos modulos **ya
existen** (migraciones 004 a 008); falta construir los controladores,
servicios y pantallas correspondientes.

## Como iniciar el sistema

**Opcion 1 — Acceso directo:** doble clic en **SIGBO-CBVC** en el Escritorio.
Verifica que el backend y el frontend queden operativos y abre el navegador
automaticamente en `http://localhost:3000/login`.

**Opcion 2 — Manual:**
```powershell
cd backend; npm run start:dev    # http://localhost:3001/api/v1
cd frontend; npm run dev         # http://localhost:3000
```

Los logs de la ultima ejecucion del acceso directo quedan en `logs/`.

## Estructura del proyecto

```
sigbo-cbvc/
├── database/
│   ├── migrations/       # 000 a 010, en orden de ejecucion
│   └── run-migrations.ps1
├── backend/               # NestJS + TypeORM + SQL Server
│   └── src/
│       ├── modules/auth/          # login, JWT, refresh tokens
│       ├── modules/seguridad/     # roles, permisos, Policy Engine
│       ├── modules/personal/      # CRUD de bomberos
│       ├── shared/entities/       # entidades TypeORM (1:1 con las tablas)
│       └── database/seed.ts       # carga permisos + roles + usuarios
├── frontend/              # Next.js 14 (App Router)
│   └── src/app/{login,dashboard}/
├── docs/                  # esta documentacion
├── start-sigbo.ps1/.cmd   # script que usa el acceso directo del Escritorio
└── Proyecto.txt           # especificacion original
```

## Requisitos tecnicos para retomar el desarrollo

- Node.js 24 LTS, SQL Server 2019 Express (instancia `SQLEXPRESS`, login SQL
  `sigbo_app`, ver `backend/.env`).
- Antes de produccion: cambiar `JWT_SECRET`/`REFRESH_TOKEN_SECRET`, forzar
  cambio de contrasena de todos los usuarios semilla, y activar
  `DB_ENCRYPT=true` con un certificado valido.
