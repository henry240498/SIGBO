# SIGBO-CBVC — Estado técnico del proyecto

SIGBO-CBVC es un sistema institucional para la gestión de un Cuerpo de Bomberos
Voluntarios. La referencia de diseño vinculante y las restricciones de trazabilidad
están en [REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md](REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md).
No deben automatizarse decisiones reservadas a autoridades: toda resolución debe
preservar autoridad, fundamento, evidencia, fecha, vigencia y auditoría.

También están disponibles las guías de [geolocalización operativa](GEOLOCALIZACION_OPERATIVA.md),
[denuncias rápidas](MODULO_DENUNCIAS_RAPIDAS.md) y el registro de
[mejoras continuas](MEJORAS_CONTINUAS.md).

## Arquitectura actual

| Componente | Implementación |
|---|---|
| Backend | Monolito modular NestJS 11, TypeORM y SQL Server |
| Frontend | Next.js 16 con App Router |
| Datos | 101 tablas en 12 esquemas, 41 migraciones funcionales |
| Seguridad | Sesiones revocables, JWT de corta vida, cookies HttpOnly, CSRF y permisos por rol/usuario |
| Archivos sensibles | Almacenamiento privado con descargas autorizadas |
| API | REST bajo `/api/v1`, Swagger sólo con habilitación explícita |

Las migraciones se ejecutan de manera explícita y con verificación SHA-256.
Consulte [database/README.md](../database/README.md) antes de crear o actualizar
una base de datos.

## Capacidades implementadas

- Personal y perfil institucional, con permisos y trazabilidad.
- Organización: unidades, cargos, rangos, tipos de bombero, brigadas,
  especialidades, compañías, cuarteles, departamentos y parametrización.
- Asistencia, guardias, órdenes de guardia, pernoctes y auditoría operativa.
- Servicios, vehículos, equipos, comunicaciones e importaciones controladas.
- Seguridad: usuarios, roles, permisos, sesiones, auditoría y preferencias.
- Denuncias públicas con tratamiento interno restringido.
- Publicaciones e identidad institucional, aisladas de los módulos operativos.
- Salud operativa y comprobación de disponibilidad de la API.

Los adjuntos de fojas de servicio, órdenes de guardia, importaciones, firmas y
perfiles no se exponen como rutas públicas. Su consulta exige una autorización
vigente y se sirve sin caché.

## Áreas pendientes de definición institucional

Academia, Finanzas, Depósito, Documentos e Inteligencia tienen estructura de datos,
pero no API ni pantallas activas. Su implementación requiere definir responsables,
reglas, evidencias, plazos y controles institucionales antes de habilitar flujos.
Igualmente, los indicadores públicos que dependan de datos de Personal, Servicios
o Vehículos requieren validación de la autoridad competente.

## Inicio local

```powershell
cd backend
npm run start:dev       # API: http://localhost:3001/api/v1

cd ..\frontend
npm run dev             # Web: http://localhost:3000
```

Para validar las migraciones sin alterar SQL Server:

```powershell
powershell -NoProfile -File .\database\run-migrations.ps1 -ValidateOnly
```

## Estructura

```text
database/                 migraciones SQL, manifiesto SHA-256 y ejecutor
backend/                  API NestJS, módulos, entidades y pruebas
frontend/                 aplicación Next.js, pantallas y componentes
docs/                     documentación técnica, normativa y de operación
.context/graph/           mapa navegable de relaciones del repositorio
.github/workflows/        compilación, pruebas, auditoría y validación continua
```

## Requisitos y preparación de producción

- Node.js 20 o posterior, y una instancia SQL Server compatible.
- Configurar secretos de JWT y refresh de al menos 32 caracteres, distintos entre sí.
- Definir orígenes CORS explícitos; no usar comodines con cookies de sesión.
- Usar `COOKIE_SECURE=true` detrás de HTTPS y activar el cifrado de base de datos.
- Crear usuarios y permisos mediante los flujos administrativos; no reutilizar
  credenciales de desarrollo.
- Ejecutar compilación, pruebas, auditoría de accesibilidad y validación del grafo
  antes de desplegar.
