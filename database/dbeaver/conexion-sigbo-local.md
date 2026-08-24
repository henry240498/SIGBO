# Conexión DBeaver — SIGBO local

Esta guía sirve para inspección local controlada. DBeaver puede acceder a información
personal, disciplinaria y operativa: usar una cuenta limitada, no una cuenta de
administración del motor, y nunca registrar contraseñas en el repositorio.

Antes de conectarse, instale el esquema con la ruta vigente:

```powershell
cd database
.\run-migrations.ps1 -Server ".\SQLEXPRESS"
```

## Alta manual

1. En DBeaver elegir **Base de datos → Nueva conexión → SQL Server**.
2. Indicar la instancia local que utilice el equipo, por ejemplo
   `localhost\SQLEXPRESS` o `localhost,1433`.
3. Seleccionar la base `sigbo_cbvc`.
4. Preferir **Windows Authentication** para una inspección local. Si se utiliza
   SQL Server Authentication, solicitar a la persona administradora un usuario
   local de privilegio mínimo; no usar credenciales de demostración ni `db_owner`.
5. Probar la conexión. Si el driver solicita TLS en un entorno local controlado,
   configurar `encrypt=false` y `trustServerCertificate=true` sólo para ese
   entorno.

## Consultas de comprobación

```sql
-- Migraciones registradas por el ejecutor vigente.
SELECT nombre, hash_sha256, aplicada_en
FROM dbo.__sigbo_migrations
ORDER BY aplicada_en, nombre;

-- Tablas por esquema, sin asumir una cifra histórica.
SELECT s.name AS esquema, COUNT(*) AS tablas
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0
GROUP BY s.name
ORDER BY s.name;

-- Relaciones físicas presentes.
SELECT COUNT(*) AS foreign_keys
FROM sys.foreign_keys;
```

## Si la conexión falla

| Síntoma | Acción segura |
|---|---|
| No responde la instancia | Confirmar nombre de instancia, servicio SQL Server y configuración de TCP/IP con la persona administradora. |
| Falla autenticación | Verificar la cuenta y el método acordados; no habilitar autenticación mixta ni restablecer contraseñas desde scripts heredados. |
| Error TLS local | Revisar el certificado; sólo en desarrollo local controlado usar las propiedades indicadas arriba. |
| No aparecen esquemas | Verificar que se conectó a `sigbo_cbvc` y que las migraciones finalizaron. |

No ejecutar `database/scripts/`, `-TestData` ni el instalador histórico para
intentar resolver una conexión: esos materiales no representan la instalación vigente.
