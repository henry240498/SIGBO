# Base de datos SIGBO-CBVC

La ruta vigente para la base de datos es `database/migrations/`, ejecutada por
`run-migrations.ps1`. Las migraciones están ordenadas mediante un manifiesto
explícito y verificadas con SHA-256 antes de conectarse a SQL Server.

## Instalación local

Requiere SQL Server compatible, `sqlcmd` y una cuenta de Windows con permiso para
crear o modificar la base local:

```powershell
cd database
.\run-migrations.ps1 -Server ".\SQLEXPRESS"
```

El nombre de base soportado actualmente es `sigbo_cbvc`, porque la migración
histórica inicial lo crea de forma explícita. El parámetro `-Database` se rechaza
para otro nombre en vez de crear o migrar una base equivocada.

`install_local.ps1` es un punto de entrada seguro equivalente. Ya no configura
TCP/IP, autenticación mixta ni usuarios SQL, y nunca carga datos sintéticos:

```powershell
.\install_local.ps1 -ValidateOnly
```

Para comprobar manifiesto, hashes y sintaxis PowerShell sin requerir SQL Server:

```powershell
.\run-migrations.ps1 -ValidateOnly
```

## Historial de migraciones

Al instalar una base vacía, el ejecutor crea `dbo.__sigbo_migrations` y registra
el hash de cada script aplicado. Las siguientes ejecuciones omiten las migraciones
ya registradas y aplican sólo las nuevas declaradas al final del manifiesto.

Si una base ya contiene tablas SIGBO pero no tiene ese historial, el ejecutor se
detiene. No se debe reaplicar DDL histórico a esa base: primero corresponde una
línea base y validación técnica/institucional de la instalación existente.

No se edita una migración ya aplicada. Para cambiar el esquema:

1. Crear un archivo nuevo con el siguiente prefijo libre.
2. Añadirlo al final de `run-migrations.ps1`.
3. Añadir su SHA-256 a `migrations.sha256`.
4. Ejecutar `-ValidateOnly` y una migración contra una base controlada.

## Configuración de la aplicación

Copiar `backend/.env.example` a `backend/.env` y definir credenciales, secretos
JWT y orígenes CORS del entorno. No se versionan contraseñas ni se crean logins
con privilegios amplios desde los scripts de migración.

En desarrollo, `npm run seed` requiere una `SIGBO_DEMO_PASSWORD` local y crea
cuentas de demostración sólo fuera de producción. Consulte
[CREDENCIALES-Y-ROLES.md](../docs/CREDENCIALES-Y-ROLES.md).

## Material histórico

`database/scripts/` y [REPORTE_REPLICACION.md](REPORTE_REPLICACION.md) se
conservan como evidencia de una reconstrucción anterior. No son la ruta de
instalación ni describen el estado actual de NestJS, Next.js, autenticación o
migraciones. No ejecutar scripts de esa carpeta para instalar SIGBO.
